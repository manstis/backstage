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
import React, { useEffect, useState } from 'react';
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
import { swfApiRef } from '../../api';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { swfTaskRouteRef } from '../../routes';

export const SWFInstanceViewerPage = () => {
  const swfApi = useApi(swfApiRef);
  const [instance, setInstance] = useState<any | undefined>(undefined);
  const { instanceId } = useRouteRefParams(swfTaskRouteRef);

  useEffect(() => {
    swfApi.getInstance(instanceId).then(value => {
      const vars: string = value.data.ProcessInstances[0].variables as string;
      value.data.ProcessInstances[0].variables = JSON.parse(vars);
      setInstance(value);
    });
  }, [swfApi, instanceId]);

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
        <ContentHeader title="Serverless Workflow - Instance">
          <SupportButton>Orchestrate things with stuff.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title="Progress">
              {instance && <pre>${JSON.stringify(instance, undefined, 2)}</pre>}
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
