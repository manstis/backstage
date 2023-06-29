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

export class WorkflowService {
  async saveWorkflowDefinition(data: any): Promise<void> {
    const swfId = data.id;
    const definitionsPath = resolvePackagePath(
      `@backstage/plugin-swf-backend`,
      `workflow-service/src/main/resources/${swfId}.sw.json`,
    );
    return fs.writeFile(definitionsPath, JSON.stringify(data), 'utf8');
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
}
