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

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  definitionsRouteRef,
  importWorkflowRouteRef,
  createWorkflowRouteRef,
  swfInstanceRouteRef,
  swfInstancesRouteRef,
  editWorkflowRouteRef,
} from '../routes';
import { SWFPage } from './SWFPage';
import { SWFInstancesViewerPage } from './SWFInstancesViewerPage';
import { SWFDefinitionViewerPage } from './SWFDefinitionViewerPage';
import { ImportWorkflowViewerPage } from './ImportWorkflowViewerPage';
import { CreateSWFPage } from './CreateSWFPage';

export const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<SWFPage />} />
      <Route
        path={definitionsRouteRef.path}
        element={<SWFDefinitionViewerPage />}
      />
      <Route
        path={swfInstancesRouteRef.path}
        element={<SWFInstancesViewerPage />}
      />
      <Route
        path={swfInstanceRouteRef.path}
        element={<SWFInstancesViewerPage />}
      />
      <Route
        path={importWorkflowRouteRef.path}
        element={<ImportWorkflowViewerPage />}
      />
      <Route path={createWorkflowRouteRef.path} element={<CreateSWFPage />} />
      <Route path={editWorkflowRouteRef.path} element={<CreateSWFPage />} />
    </Routes>
  );
};
