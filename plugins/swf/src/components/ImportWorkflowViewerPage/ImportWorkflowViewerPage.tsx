/*
 * Copyright 2021 The Backstage Authors
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
  Content,
  ContentHeader,
  Header,
  InfoCard,
  Page,
} from '@backstage/core-components';
import {
  configApiRef,
  errorApiRef,
  useApi,
  useRouteRef,
} from '@backstage/core-plugin-api';
import {
  Grid,
  StepButton,
  TextField,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { useCallback } from 'react';
import { swfApiRef } from '../../api';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { definitionsRouteRef } from '../../routes';

type FormData = {
  url: string;
};

export const ImportWorkflowViewerPage = () => {
  const theme = useTheme();
  const configApi = useApi(configApiRef);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const appTitle = configApi.getOptional('app.title') || 'Backstage';

  const errorApi = useApi(errorApiRef);
  const swfApi = useApi(swfApiRef);

  const defaultValues: FormData = {
    url: 'https://raw.githubusercontent.com/kiegroup/kogito-examples/main/serverless-workflow-examples/serverless-workflow-hello-world/src/main/resources/hello.sw.json',
  };
  const { handleSubmit, register } = useForm<FormData>({ defaultValues });

  const navigate = useNavigate();
  const definitionLink = useRouteRef(definitionsRouteRef);

  const handleResult = useCallback(
    async ({ url }: FormData) => {
      try {
        const result = await swfApi.createWorkflowDefinition(
          url,
          // just to test
          JSON.stringify({
            id: 'swf200',
            version: '1.0',
            specVersion: '0.8',
            name: 'Hello World Workflow',
            description: 'JSON based hello world workflow',
            start: 'Inject Hello World',
            states: [
              {
                name: 'Inject Hello World',
                type: 'inject',
                data: {
                  greeting: 'Hello World',
                },
                transition: 'Inject Mantra',
              },
              {
                name: 'Inject Mantra',
                type: 'inject',
                data: {
                  mantra: 'Serverless Workflow is awesome!',
                },
                end: true,
              },
            ],
          }),
        );

        if (!result || !result.id) {
          errorApi.post(new Error('error importing workflow'));
        } else {
          navigate(definitionLink({ swfId: result.id }));
        }
      } catch (e: any) {
        errorApi.post(new Error(e));
      }
    },
    [swfApi, errorApi, navigate, definitionLink],
  );

  function asInputRef(renderResult: UseFormRegisterReturn) {
    const { ref, ...rest } = renderResult;
    return {
      inputRef: ref,
      ...rest,
    };
  }

  const contentItems = [
    <Grid item xs={12} md={8} lg={6} xl={4} key="import0">
      <InfoCard>
        <form onSubmit={handleSubmit(handleResult)}>
          <TextField
            {...asInputRef(
              register('url', {
                required: true,
              }),
            )}
            fullWidth
            id="url"
            label="Workflow URL"
            placeholder="https://raw.githubusercontent.com/kiegroup/kogito-examples/main/serverless-workflow-examples/serverless-workflow-hello-world/src/main/resources/hello.sw.json"
            helperText="Enter the full path to your workflow definition"
            margin="normal"
            variant="outlined"
            required
          />

          <Grid container spacing={0}>
            <StepButton type="submit" title="Import workflow">
              Import
            </StepButton>
          </Grid>
        </form>
      </InfoCard>
    </Grid>,
  ];

  return (
    <Page themeId="home">
      <Header title="Register a new Workflow" />
      <Content>
        <ContentHeader
          title={`Select the new Workflow definition to be imported in ${appTitle}`}
        />

        <Grid container spacing={2}>
          {isMobile ? contentItems : contentItems.reverse()}
        </Grid>
      </Content>
    </Page>
  );
};
