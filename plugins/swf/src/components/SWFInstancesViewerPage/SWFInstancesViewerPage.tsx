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
import React, { useCallback, useState } from 'react';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  SupportButton,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { ProcessVariablesViewer } from './ProcessVariablesViewer';
import { ProcessGraphViewer } from './ProcessGraphViewer';
import { ProcessInstancesTable } from './ProcessInstancesTable';
import { ProcessInstance } from '@backstage/plugin-swf-common';
import { ProcessDetailsViewer } from './ProcessDetailsViewer';
import { ProcessTimeline } from './ProcessTimeline';

export const SWFInstancesViewerPage = () => {
  const swfApi = useApi(swfApiRef);
  const [data, setData] = useState<Row[]>([]);
  const [swfId, setSwfId] = useState<string>();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();
  const { instanceId } = useRouteRefParams(swfInstanceRouteRef);

  const { swfFile, swfEditorRef, swfEditorEnvelopeLocator } =
    useServerlessWorkflowDiagramEditor(swfId, 'serverless-workflow');

  const loadInstance = useCallback(
    (pid: string | undefined) => {
      if (pid) {
        swfApi.getInstance(pid).then(value => {
          const processInstances: any[] = value.data.ProcessInstances as [];
          setSwfId(processInstances[0].processId);
          setSelectedInstanceId(processInstances[0].id);
        });
      }
    },
    [swfApi],
  );

  const column1 = {
    title: 'Id',
    field: 'pid',
  };

  const column2 = {
    title: 'Name',
    field: 'name',
  };
  const [selectedInstance, setSelectedInstance] = useState<ProcessInstance>();

  const toJsonVariables = useCallback(() => {
    const variables: string | undefined = selectedInstance?.variables;
    return variables ? JSON.parse(variables) : undefined;
  }, [selectedInstance]);

  return (
    <Page themeId="tool">
      <Header
        title="Serverless Workflow"
        subtitle="Where all your SWF needs come to life!"
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Serverless Workflow - Instances">
          <SupportButton>Orchestrate things with stuff.</SupportButton>
        </ContentHeader>
        <Grid container direction="row">
          <Grid item xs={12} lg={8}>
            <InfoCard title="Instances">
              <ProcessInstancesTable
                selectedInstance={selectedInstance}
                setSelectedInstance={setSelectedInstance}
              />
            </InfoCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <ProcessGraphViewer swfId={selectedInstance?.processId} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <ProcessVariablesViewer variables={toJsonVariables()} />
          </Grid>
          <Grid item xs={12} lg={4}>
            <ProcessTimeline selectedInstance={selectedInstance} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <ProcessDetailsViewer selectedInstance={selectedInstance} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
