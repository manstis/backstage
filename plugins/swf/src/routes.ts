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
import { createRouteRef, createSubRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'swf',
});

// This route demos a standalone plugin and is not integrated into Scaffolder
export const definitionsRouteRef = createSubRouteRef({
  id: 'swf/items',
  parent: rootRouteRef,
  path: '/items/:swfId',
});

// This route integrates with Scaffolder and lists all SWF instances
export const swfInstancesRouteRef = createSubRouteRef({
  id: 'swf/instance',
  parent: rootRouteRef,
  path: '/instances',
});

// This route integrates with Scaffolder and lists all SWF instances, selecting a specific one.
export const swfInstanceRouteRef = createSubRouteRef({
  id: 'swf/instance',
  parent: rootRouteRef,
  path: '/instances/:instanceId',
});

export const importWorkflowRouteRef = createSubRouteRef({
  id: 'swf/workflows/import',
  parent: rootRouteRef,
  path: '/workflows/import',
});
