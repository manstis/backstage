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

export interface RouterOptions {
  logger: Logger;
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

const items: SwfItem[] = [
  { id: 'swf1', title: 'Hello world', definition: swf1 },
  {
    id: 'swf2',
    title: 'Provision Quarkus cloud application',
    definition: swf2,
  },
];
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  const result: SwfListResult = {
    items: items,
    limit: 0,
    offset: 0,
    totalCount: 2,
  };
  router.get('/items', async (_, res) => {
    res.status(200).json(result);
  });
  router.get('/items/:swfId', async (req, res) => {
    const {
      params: { swfId },
    } = req;
    const item = items.find(i => i.id === swfId);
    if (item !== undefined) {
      res.status(200).json(item);
    } else {
      res.status(404);
    }
  });

  // starting kogito runtime as a child process
  const childProcess = require('child_process');
  childProcess.exec(
    'java -Dquarkus.http.port=8899 -jar ../../plugins/swf-backend/workflow-service/target/quarkus-app/quarkus-run.jar',
    (error, stdout, stderr) => {
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

  // proxy
  const httpProxy = require('express-http-proxy');
  const kogitoRuntimeProxy = httpProxy('http://localhost:8899');
  router.use('/workflow-service', async (req, res, next) => {
    console.log('proxying request to kogito on', req.path);
    kogitoRuntimeProxy(req, res, next);
  });

  router.use(errorHandler());
  return router;
}
