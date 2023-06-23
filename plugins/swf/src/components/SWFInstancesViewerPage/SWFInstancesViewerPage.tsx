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
  Table,
  TableProps,
} from '@backstage/core-components';
import { Dialog, DialogTitle, Grid, Typography } from '@material-ui/core';
import { swfApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';
import OpenInNew from '@material-ui/icons/OpenInNew';
import { useServerlessWorkflowEditor } from '../../hooks';
import { EmbeddedEditor } from '@kie-tools-core/editor/dist/embedded';
import { ChannelType } from '@kie-tools-core/editor/dist/api';

interface Row {
  pid: string;
  name: string;
  state: string;
}
export const SWFInstancesViewerPage = () => {
  const swfApi = useApi(swfApiRef);
  const [data, setData] = useState<Row[]>([]);
  const { swfFile, swfEditorRef, swfEditorEnvelopeLocator } =
    useServerlessWorkflowEditor('swf1', 'serverless-workflow');
  const [open, setOpen] = useState<boolean>(false);
  const [swfTitle, setSwfTitle] = useState<string>('');

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

  const defaultActions: TableProps<Row>['actions'] = [
    (row: Row) => {
      const title = 'View';

      return {
        icon: () => (
          <>
            <Typography variant="srOnly">{title}</Typography>
            <OpenInNew fontSize="small" />
          </>
        ),
        tooltip: title,
        onClick: () => {
          setOpen(true);
          setSwfTitle(row.name);
        },
      };
    },
  ];

  useEffect(() => {
    swfApi.getInstances().then(value => {
      const processInstances: any[] = value.data.ProcessInstances as [];
      const rows: Row[] = processInstances.map(pi => {
        return {
          pid: pi.id,
          name: pi.processId,
          state: pi.state,
        };
      });
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
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title="Instances">
              <Table<Row>
                data={data}
                columns={[column1, column2, column3]}
                emptyContent={<div>Empty</div>}
                actions={defaultActions}
                options={{
                  actionsColumnIndex: -1,
                  padding: 'dense',
                }}
              />
            </InfoCard>
          </Grid>
        </Grid>
        {swfFile && (
          <Dialog onClose={_ => setOpen(false)} open={open}>
            <DialogTitle>{swfTitle}</DialogTitle>
            <div style={{ height: '500px', width: '500px', padding: '10px' }}>
              <EmbeddedEditor
                ref={swfEditorRef}
                file={swfFile}
                channelType={ChannelType.ONLINE}
                editorEnvelopeLocator={swfEditorEnvelopeLocator}
                locale="en"
              />
            </div>
          </Dialog>
        )}
      </Content>
    </Page>
  );
};
