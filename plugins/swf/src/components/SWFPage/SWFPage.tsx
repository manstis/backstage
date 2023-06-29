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
import { Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { SWFDefinitionsListComponent } from '../SWFDefinitionsListComponent';
import { EmbeddedEditor } from '@kie-tools-core/editor/dist/embedded';
import { ChannelType } from '@kie-tools-core/editor/dist/api';
import { useServerlessWorkflowCombinedEditor } from '../../hooks/useServerlessWorkflowCombinedEditor';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

export const SWFPage = () => {
  const { swfFile, swfEditor, swfEditorRef, swfEditorEnvelopeLocator } =
    useServerlessWorkflowCombinedEditor('swf1', 'serverless-workflow');

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
        <ContentHeader title="Serverless Workflow">
          <SupportButton>Orchestrate things with stuff.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard
              title={
                <>
                  <Typography variant="h5">
                    Author - Example of how we could support authoring
                  </Typography>
                  <Button
                    color="primary"
                    onClick={() => {
                      /* eslint-disable-next-line no-alert */
                      swfEditor?.getContent().then(c => window.alert(c));
                    }}
                  >
                    Save...
                  </Button>
                </>
              }
            >
              <div style={{ height: '500px', padding: '10px' }}>
                {swfFile && (
                  <EmbeddedEditor
                    ref={swfEditorRef}
                    file={swfFile}
                    channelType={ChannelType.ONLINE}
                    editorEnvelopeLocator={swfEditorEnvelopeLocator}
                    locale="en"
                  />
                )}
              </div>
            </InfoCard>
            <InfoCard title="Workflows">
              <SWFDefinitionsListComponent />
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
