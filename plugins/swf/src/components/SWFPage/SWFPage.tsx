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
import {
  workflow_title,
  workflow_title_plural,
} from '@backstage/plugin-swf-common';

export const SWFPage = () => {
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
        <ContentHeader title={workflow_title}>
          <SupportButton>Orchestrate things with stuff.</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title={workflow_title_plural}>
              <SWFDefinitionsListComponent />
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
