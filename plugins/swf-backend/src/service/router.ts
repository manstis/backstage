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
import { SwfListResult } from '../api/types';

export interface RouterOptions {
  logger: Logger;
}

const swf1 =
  '{\n' +
  '  "id": "hello_world",\n' +
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
    items: [{ definition: swf1 }],
    limit: 0,
    offset: 0,
    totalCount: 1,
  };
  router.get('/workflows', async (_, res) => {
    res.status(200).json(result);
  });

  router.use(errorHandler());
  return router;
}
