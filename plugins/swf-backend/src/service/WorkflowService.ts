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
import { resolvePackagePath } from '@backstage/backend-common';
import fs from 'fs-extra';
import { OpenApiService } from './OpenApiService';
import { actions_open_api_file_path } from '@backstage/plugin-swf-common';

export class WorkflowService {
  private openApiService: OpenApiService;
  private readonly resourcesPath = `workflows/`;

  constructor(openApiService: OpenApiService) {
    this.openApiService = openApiService;
  }

  async saveWorkflowDefinition(data: any): Promise<any> {
    const swfId = data.id;
    const definitionsPath = resolvePackagePath(
      `@backstage/plugin-swf-backend`,
      `${this.resourcesPath}/${swfId}.sw.json`,
    );
    return this.saveFile(definitionsPath, data);
  }

  private saveFile(path: string, data: any) {
    return fs.writeFile(path, JSON.stringify(data), 'utf8').then(_ => data);
  }

  async saveWorkflowDefinitionFromUrl(url: string): Promise<any> {
    return this.fetchWorkflowDefinitionFromUrl(url).then(
      this.saveWorkflowDefinition,
    );
  }

  async fetchWorkflowDefinitionFromUrl(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  async saveOpenApi(): Promise<any> {
    const path = resolvePackagePath(
      `@backstage/plugin-swf-backend`,
      `${this.resourcesPath}${actions_open_api_file_path}`,
    );
    return this.openApiService.generateOpenApi().then(data => {
      if (data) {
        this.saveFile(path, data);
      }
    });
  }

  async deleteWorkflowDefinitionById(swfId: string): Promise<void> {
    const definitionsPath = resolvePackagePath(
      `@backstage/plugin-swf-backend`,
      `${this.resourcesPath}${swfId}.sw.json`,
    );
    return fs.rm(definitionsPath, { force: true });
  }
}
