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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { swfApiRef } from '../../api';
import { definitionsRouteRef } from '../../routes';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import {
  ChannelType,
  EditorEnvelopeLocator,
  EnvelopeContentType,
  EnvelopeMapping,
} from '@kie-tools-core/editor/dist/api';
import { EmbeddedEditorFile } from '@kie-tools-core/editor/dist/channel';
import {
  EmbeddedEditor,
  useEditorRef,
} from '@kie-tools-core/editor/dist/embedded';
import { workflow_title } from '@backstage/plugin-swf-common';

export const SWFDefinitionViewerPage = () => {
  const { editorRef } = useEditorRef();
  const [embeddedEditorFile, setEmbeddedEditorFile] =
    useState<EmbeddedEditorFile>();

  const swfApi = useApi(swfApiRef);
  const [name, setName] = useState<string>();
  const { swfId } = useRouteRefParams(definitionsRouteRef);

  const editorEnvelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'swf',
          filePathGlob: '*.swf',
          resourcesPathPrefix: '',
          envelopeContent: {
            type: EnvelopeContentType.PATH,
            path: 'serverless-workflow-diagram-editor-envelope.html',
          },
        }),
      ]),
    [],
  );

  const setContent = useCallback((path: string, content: string) => {
    setEmbeddedEditorFile({
      path: path,
      getFileContents: async () => content,
      isReadOnly: false,
      fileExtension: 'swf',
      fileName: 'fileName',
    });
  }, []);

  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    swfApi
      .getSwf(swfId)
      .then(value => {
        setName(value.name);
        setContent('fileName.swf', value.definition);
        setLoading(false);
      })
      .catch(() => {
        setContent(`fileName.swf`, `{}`);
        setLoading(false);
      });
  }, [swfApi, swfId, setContent, setLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Page themeId="tool">
      <Header
        title={workflow_title}
        subtitle={`Where all your ${workflow_title} needs come to life!`}
      >
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title={`${workflow_title} Definition`}>
          <SupportButton>Orchestrate things with stuff.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            {loading && <Progress />}
            <InfoCard title={name || ''}>
              <div style={{ height: '500px' }}>
                {embeddedEditorFile && (
                  <EmbeddedEditor
                    ref={editorRef}
                    file={embeddedEditorFile}
                    channelType={ChannelType.ONLINE}
                    editorEnvelopeLocator={editorEnvelopeLocator}
                    locale="en"
                  />
                )}
              </div>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
