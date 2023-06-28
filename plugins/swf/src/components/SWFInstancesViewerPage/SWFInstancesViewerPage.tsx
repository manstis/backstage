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
import React, { useCallback, useEffect, useState } from 'react';
import {
  Content,
  ContentHeader,
  Header,
  HeaderLabel,
  InfoCard,
  Page,
  SupportButton,
  Table,
} from '@backstage/core-components';
import { Grid } from '@material-ui/core';
import { swfApiRef } from '../../api';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { useServerlessWorkflowEditor } from '../../hooks';
import { EmbeddedEditor } from '@kie-tools-core/editor/dist/embedded';
import { ChannelType } from '@kie-tools-core/editor/dist/api';
import { swfInstanceRouteRef } from '../../routes';

interface Row {
  pid: string;
  name: string;
  state: string;
}
export const SWFInstancesViewerPage = () => {
  const swfApi = useApi(swfApiRef);
  const [data, setData] = useState<Row[]>([]);
  const [swfId, setSwfId] = useState<string>();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>();
  const { instanceId } = useRouteRefParams(swfInstanceRouteRef);

  const { swfFile, swfEditorRef, swfEditorEnvelopeLocator } =
    useServerlessWorkflowEditor(swfId, 'serverless-workflow');

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

  const column3 = {
    title: 'State',
    field: 'state',
  };

  useEffect(() => {
    const selectedRowData = data.find(d => d.pid === instanceId);
    if (selectedRowData) {
      loadInstance(selectedRowData.pid);
    }
  }, [loadInstance, data, instanceId]);

  useEffect(() => {
    swfApi.getInstances().then(value => {
      const processInstances: any[] = value.data.ProcessInstances as [];
      const rows: Row[] = processInstances
        .map(pi => {
          return {
            pid: pi.id,
            name: pi.processId,
            state: pi.state,
          };
        })
        .reverse();
      setData(rows);
    });
  }, [swfApi]);

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
              <Table<Row>
                data={data}
                columns={[column1, column2, column3]}
                onRowClick={(_, rowData) => {
                  loadInstance(rowData?.pid);
                }}
                options={{
                  padding: 'dense',
                  rowStyle: (rowData: Row) => {
                    return rowData.pid === selectedInstanceId
                      ? { backgroundColor: '#a266e5' }
                      : {};
                  },
                }}
              />
            </InfoCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <InfoCard title="Status">
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
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
