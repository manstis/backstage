/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { SwfItem, SwfListResult } from '@backstage/plugin-swf-common';
import { ExecException } from 'child_process';
import fetch from 'node-fetch';
import { EventBroker } from '@backstage/plugin-events-node';
import { topic } from '@backstage/plugin-swf-common';
import { Config } from '@backstage/config';
import { DiscoveryApi } from '@backstage/core-plugin-api';

export interface RouterOptions {
  eventBroker: EventBroker;
  config: Config;
  logger: Logger;
  discovery: DiscoveryApi;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { eventBroker, config, logger, discovery } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const kogitoBaseUrl =
    config.getOptionalString('swf.baseUrl') ?? 'http://localhost';
  const kogitoPort = config.getOptionalNumber('swf.port') ?? 8899;
  logger.info(
    `Using kogito Serverless Workflow Url of: ${kogitoBaseUrl}:${kogitoPort}`,
  );

  router.get('/items', async (_, res) => {
    const serviceRes = await fetch(
      `${kogitoBaseUrl}:${kogitoPort}/management/processes`,
    );
    const data = await serviceRes.json();
    const items: SwfItem[] = data.map((swf: SwfItem) => {
      const swfItem: SwfItem = {
        id: swf.id,
        name: swf.name,
        definition: '',
      };
      return swfItem;
    });
    const result: SwfListResult = {
      items: items,
      limit: 0,
      offset: 0,
      totalCount: items.length,
    };
    res.status(200).json(result);
  });

  // @ts-ignore
  router.get('/items/:swfId', async (req, res) => {
    const {
      params: { swfId },
    } = req;

    // Delegate to kogito service
    const wsRequest = await fetch(
      `${kogitoBaseUrl}:${kogitoPort}/management/processes/${swfId}/source`,
    );
    const wsResponse = await wsRequest.json();
    const name = wsResponse.name;
    const swfItem: SwfItem = {
      id: swfId,
      name: name,
      definition: JSON.stringify(wsResponse),
    };

    // When complete return to Backstage
    res.status(200).json(swfItem);
  });

  // call BS Scaffolder actions
  router.get('/actions', async (_, res) => {
    const scaffolderUrl = await discovery.getBaseUrl('scaffolder');
    const response = await fetch(`${scaffolderUrl}/v2/actions`);
    const json = await response.json();
    res.status(response.status).json(json);
  });

  router.post('/actions/:actionId', async (req, res) => {
    const { actionId } = req.params;
    const scaffolderUrl = await discovery.getBaseUrl('scaffolder');
    const requestBody = req.body;
    const wsRequest = await fetch(`${scaffolderUrl}/v2/actions/${actionId}`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'content-type': 'application/json' },
    });
    const response = await wsRequest.json();
    res.status(wsRequest.status).json(response);
  });

  // starting kogito runtime as a child process
  const childProcess = require('child_process');
  childProcess.exec(
    `java -Dquarkus.http.port=${kogitoPort} -jar ../../plugins/swf-backend/workflow-service/target/quarkus-app/quarkus-run.jar`,
    (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(`error: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log(`stdout:\n${stdout}`);
    },
  );

  // We need to ensure the service is running!
  let retryCount = 0;
  let polling = true;
  while (polling) {
    try {
      const healthCheckResponse = await fetch(
        `${kogitoBaseUrl}:${kogitoPort}/q/health`,
      );
      polling = !healthCheckResponse.ok;
      if (!healthCheckResponse.ok) {
        // Throw local error to re-use retry mechanism.
        throw new Error('Retry');
      }
    } catch (e) {
      if (retryCount > 5) {
        retryCount++;
        logger.error(
          'Kogito failed to start. Serverless Workflow Templates could not be loaded.',
        );
        polling = false;
      }
    }
  }
  await eventBroker.publish({
    topic: topic,
    eventPayload: {},
  });

  router.use(errorHandler());
  return router;
}
