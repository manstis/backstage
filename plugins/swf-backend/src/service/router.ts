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
import { DiscoveryApi } from '@backstage/core-plugin-api';

export interface RouterOptions {
  logger: Logger;
  discoveryApi: DiscoveryApi;
}

const swf1 =
  '{\n' +
  '  "id": "swf1",\n' +
  '  "version": "1.0",\n' +
  '  "specVersion": "0.8",\n' +
  '  "name": "Hello World Workflow",\n' +
  '  "description": "JSON based hello world workflow",\n' +
  '  "start": "Inject Hello World",\n' +
  '  "states": [\n' +
  '    {\n' +
  '      "name": "Inject Hello World",\n' +
  '      "type": "inject",\n' +
  '      "data": {\n' +
  '        "greeting": "Hello World"\n' +
  '      },\n' +
  '      "transition": "Inject Mantra"\n' +
  '    },\n' +
  '    {\n' +
  '      "name": "Inject Mantra",\n' +
  '      "type": "inject",\n' +
  '      "data": {\n' +
  '        "mantra": "Serverless Workflow is awesome!"\n' +
  '      },\n' +
  '      "end": true\n' +
  '    }\n' +
  '  ]\n' +
  '}';

const swf2 =
  '{\n' +
  '  "id": "swf2",\n' +
  '  "version": "1.0",\n' +
  '  "name": "Provision Quarkus cloud application",\n' +
  '  "description": "Provision Quarkus cloud application",\n' +
  '  "errors": [\n' +
  '    {\n' +
  '      "name": "execution error",\n' +
  '      "code": "java.util.concurrent.CompletionException"\n' +
  '    }\n' +
  '  ],\n' +
  '  "start": "waitForEvent",\n' +
  '  "events": [\n' +
  '    {\n' +
  '      "name": "resumeEvent",\n' +
  '      "source": "",\n' +
  '      "type": "resume"\n' +
  '    },\n' +
  '    {\n' +
  '      "name": "waitEvent",\n' +
  '      "source": "",\n' +
  '      "type": "wait"\n' +
  '    }\n' +
  '  ],\n' +
  '  "functions": [\n' +
  '    {\n' +
  '      "name": "printInstanceId",\n' +
  '      "type": "custom",\n' +
  '      "operation": "service:java:org.kie.kogito.examples.PrintService::printKogitoProcessId"\n' +
  '    }\n' +
  '  ],\n' +
  '  "states": [\n' +
  '    {\n' +
  '      "name": "waitForEvent",\n' +
  '      "type": "callback",\n' +
  '      "action": {\n' +
  '        "name": "publishAction",\n' +
  '        "eventRef": {\n' +
  '          "triggerEventRef": "resumeEvent",\n' +
  '          "data": "{move: \\"This is the initial data in the model\\"}"\n' +
  '        }\n' +
  '      },\n' +
  '      "eventRef": "waitEvent",\n' +
  '      "eventDataFilter": {\n' +
  '        "data": ".result",\n' +
  '        "toStateData": ".move"\n' +
  '      },\n' +
  '      "onErrors": [\n' +
  '        {\n' +
  '          "errorRef": "execution error",\n' +
  '          "end": true\n' +
  '        }\n' +
  '      ],\n' +
  '      "transition": "finish"\n' +
  '    },\n' +
  '    {\n' +
  '      "name": "finish",\n' +
  '      "type": "operation",\n' +
  '      "actions": [\n' +
  '        {\n' +
  '          "name": "printInstanceId",\n' +
  '          "functionRef": {\n' +
  '            "refName": "printInstanceId"\n' +
  '          }\n' +
  '        }\n' +
  '      ],\n' +
  '      "end": true\n' +
  '    }\n' +
  '  ]\n' +
  '}';

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const logger = options.logger;
  const discovery = options.discoveryApi;
  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/items', async (_, res) => {
    const serviceRes = await fetch(
      `http://localhost:8899/management/processes`,
    );
    const data = await serviceRes.json();
    const items = data.map(swfId => {
      const swfItem: SwfItem = {
        id: swfId,
        title: swfId,
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
    const res2 = await fetch(
      `http://localhost:8899/management/processes/${swfId}/source`,
    );
    const data = await res2.json();
    const title = data.name;
    const swfItem: SwfItem = {
      id: swfId,
      title: title,
      definition: JSON.stringify(data),
    };
    res.status(200).json(swfItem);
  });

  // call BS Scaffolder actions
  router.get('/actions', async (req, res) => {
    const scaffolderUrl = await discovery.getBaseUrl('scaffolder');
    const response = await fetch(`${scaffolderUrl}/v2/actions`);
    const json = await response.json();
    res.status(response.status).json(json);
  });

  router.post('/actions/:id', async (req, res) => {
    res.status(200);
  });

  // starting kogito runtime as a child process
  const childProcess = require('child_process');
  childProcess.exec(
    'java -Dquarkus.http.port=8899 -jar ../../plugins/swf-backend/workflow-service/target/quarkus-app/quarkus-run.jar',
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

  router.use(errorHandler());
  return router;
}
