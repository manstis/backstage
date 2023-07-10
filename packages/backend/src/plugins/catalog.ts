/*
 * Copyright 2020 The Backstage Authors
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

import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { DemoEventBasedEntityProvider } from './DemoEventBasedEntityProvider';
import { UnprocessedEntitesModule } from '@backstage/plugin-catalog-backend-module-unprocessed';
import { ServerlessWorkflowEntityProvider } from '@backstage/plugin-swf-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());

  const demoProvider = new DemoEventBasedEntityProvider({
    logger: env.logger,
    topics: ['example'],
    eventBroker: env.eventBroker,
  });
  builder.addEntityProvider(demoProvider);

  // SWF Entity Provider
  const config = env.config;
  const logger = env.logger;
  const kogitoBaseUrl =
    config.getOptionalString('swf.baseUrl') ?? 'http://localhost';
  const kogitoPort = config.getOptionalNumber('swf.port') ?? 8899;
  logger.info(
    `Using kogito Serverless Workflow Url of: ${kogitoBaseUrl}:${kogitoPort}`,
  );
  const owner =
    config.getOptionalString('swf.workflow-service.owner') ?? 'infrastructure';
  const environment =
    config.getOptionalString('swf.workflow-service.environment') ??
    'development';

  const swfProvider = new ServerlessWorkflowEntityProvider({
    reader: env.reader,
    kogitoServiceUrl: `${kogitoBaseUrl}:${kogitoPort}`,
    eventBroker: env.eventBroker,
    scheduler: env.scheduler,
    logger: env.logger,
    owner: owner,
    env: environment,
  });
  builder.addEntityProvider(swfProvider);

  const { processingEngine, router } = await builder.build();

  const unprocessed = new UnprocessedEntitesModule(
    await env.database.getClient(),
    router,
  );
  unprocessed.registerRoutes();
  await processingEngine.start();
  return router;
}
