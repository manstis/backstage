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
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import { Logger } from 'winston';
import { UrlReader } from '@backstage/backend-common';
import { Entity } from '@backstage/catalog-model';
import {
  EventBroker,
  EventParams,
  EventSubscriber,
} from '@backstage/plugin-events-node';
import { SwfItem, topic, workflow_type } from '@backstage/plugin-swf-common';
import {
  TemplateEntityV1beta3,
  TemplateParametersV1beta3,
} from '@backstage/plugin-scaffolder-common';
import YAML from 'yaml';
import { PluginTaskScheduler } from '@backstage/backend-tasks';

export class ServerlessWorkflowEntityProvider
  implements EntityProvider, EventSubscriber
{
  private readonly reader: UrlReader;
  private readonly kogitoServiceUrl: string;

  private connection: EntityProviderConnection | undefined;
  private readonly scheduler: PluginTaskScheduler;
  private readonly logger: Logger;
  private readonly owner: string;
  private readonly env: string;

  constructor(opts: {
    reader: UrlReader;
    kogitoServiceUrl: string;
    eventBroker: EventBroker;
    scheduler: PluginTaskScheduler;
    logger: Logger;
    owner: string;
    env: string;
  }) {
    const {
      reader,
      kogitoServiceUrl,
      eventBroker,
      scheduler,
      owner,
      logger,
      env,
    } = opts;
    this.reader = reader;
    this.kogitoServiceUrl = kogitoServiceUrl;
    this.scheduler = scheduler;
    this.owner = owner;
    this.logger = logger;
    this.env = env;
    eventBroker.subscribe(this);
  }

  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    // periodically fetch new workflows
    return this.startRefreshTask();
  }

  private async startRefreshTask(): Promise<void> {
    return this.scheduler.scheduleTask({
      id: 'run_swf_provider_refresh',
      fn: async () => {
        await this.run();
      },
      frequency: { seconds: 5 },
      timeout: { minutes: 10 },
    });
  }

  supportsEventTopics(): string[] {
    return [topic];
  }

  async onEvent(params: EventParams): Promise<void> {
    if (params.topic !== topic) {
      return;
    }
    await this.run();
  }

  async run() {
    if (this.reader === undefined) {
      return;
    }
    if (this.connection === undefined) {
      return;
    }
    if (this.kogitoServiceUrl === undefined) {
      return;
    }

    this.logger.info('Retrieving Serverless Workflow definitions');

    // Load OpenAPI definitions
    const oaResponse = await this.reader.readUrl(
      `${this.kogitoServiceUrl}/q/openapi`,
    );
    const oaBuffer = await oaResponse.buffer();
    const oaData = YAML.parse(oaBuffer.toString());

    const items: SwfItem[] = oaData.tags?.map((swf: SwfItem) => {
      const swfItem: SwfItem = {
        id: swf.name,
        name: swf.name,
        description: swf.description,
        definition: '',
      };
      return swfItem;
    });
    const entities: Entity[] = items ? this.swfToEntities(items, oaData) : [];

    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `swf-provider:${this.env}`,
      })),
    });
  }

  getProviderName(): string {
    return ServerlessWorkflowEntityProvider.name;
  }

  private makeBackstageTemplateParameters(
    item: SwfItem,
    openApiDefinitions: any,
  ): TemplateParametersV1beta3 | undefined {
    const id: string = item.id;
    const oaPaths: any = openApiDefinitions.paths;
    if (oaPaths === undefined) {
      this.logger.error(
        `Unable to locate OpenAPI paths definition. Zero parameters will be available.`,
      );
      return undefined;
    }
    const oaSchema: any =
      oaPaths[`/${id}`]?.post?.requestBody?.content[`application/json`]?.schema;
    if (oaSchema === undefined) {
      this.logger.error(
        `Unable to locate OpenAPI schema for '${id}'. Zero parameters will be available.`,
      );
      return undefined;
    }

    return {
      title: 'Fill in some input parameters',
      required: oaSchema.required,
      properties: oaSchema.properties,
    };
  }

  private swfToEntities(
    items: SwfItem[],
    openApiDefinitions: any,
  ): TemplateEntityV1beta3[] {
    return items.map(i => {
      return {
        apiVersion: 'scaffolder.backstage.io/v1beta3',
        kind: 'Template',
        metadata: {
          name: i.id,
          title: i.name,
          description: i.description,
          tags: ['experimental', workflow_type],
          annotations: {
            'backstage.io/managed-by-location': `url:${this.kogitoServiceUrl}`,
            'backstage.io/managed-by-origin-location': `url:${this.kogitoServiceUrl}`,
            'backstage.io/source-location': `url:${this.kogitoServiceUrl}/management/processes/${i.id}/source`,
            'backstage.io/view-url': `${this.kogitoServiceUrl}/management/processes/${i.id}/source`,
          },
        },
        spec: {
          owner: this.owner,
          type: workflow_type,
          steps: [],
          parameters: this.makeBackstageTemplateParameters(
            i,
            openApiDefinitions,
          ),
        },
      };
    });
  }
}
