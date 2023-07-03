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

export const SWFInstancesViewerPage = () => {
  const [selectedInstance, setSelectedInstance] =
    useState<Record<string, unknown>>();

  const toJsonVariables = useCallback(() => {
    const variables: string | unknown = selectedInstance?.variables;
    return variables ? JSON.parse(variables as string) : undefined;
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
            <ProcessGraphViewer swfId={selectedInstance?.processId as string} />
          </Grid>
          <Grid item xs={12} lg={8}>
            <ProcessVariablesViewer variables={toJsonVariables()} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
