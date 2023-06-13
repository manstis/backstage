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
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { swfApiRef, SwfClient } from './api';

export const swfPlugin = createPlugin({
  id: 'swf',
  apis: [
    createApiFactory({
      api: swfApiRef,
      deps: { discoveryApi: discoveryApiRef },
      factory({ discoveryApi }) {
        return new SwfClient({ discoveryApi });
      },
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const SwfPage = swfPlugin.provide(
  createRoutableExtension({
    name: 'SwfPage',
    component: () => import('./components/SWFPage').then(m => m.SWFPage),
    mountPoint: rootRouteRef,
  }),
);
