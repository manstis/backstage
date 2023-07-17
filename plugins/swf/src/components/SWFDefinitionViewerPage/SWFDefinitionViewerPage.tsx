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
import { useRouteRefParams } from '@backstage/core-plugin-api';
import { definitionsRouteRef } from '../../routes';
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
import { workflow_title } from '@backstage/plugin-swf-common';
import { SWFEditor } from '../SWFEditor';
import { EditorViewKind, SWFEditorRef } from '../SWFEditor/SWFEditor';
import { useController } from '@kie-tools-core/react-hooks/dist/useController';

export const SWFDefinitionViewerPage = () => {
  const [name, setName] = useState<string>();
  const { swfId } = useRouteRefParams(definitionsRouteRef);
  const [swfEditor, swfEditorRef] = useController<SWFEditorRef>();

  useEffect(() => {
    if (!swfEditor?.swfItem) {
      return;
    }
    setName(swfEditor.swfItem.name);
  }, [swfEditor]);

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
            <InfoCard title={name || ''}>
              <div style={{ height: '500px' }}>
                <SWFEditor
                  ref={swfEditorRef}
                  kind={EditorViewKind.DIAGRAM_VIEWER}
                  swfId={swfId}
                />
              </div>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
