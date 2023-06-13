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
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { swfApiRef } from '../../api';
import { SwfItem } from '@backstage/plugin-swf-common';
import Pageview from '@material-ui/icons/Pageview';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Subscriptions from '@material-ui/icons/Subscriptions';
import { definitionsRouteRef } from '../../routes';
import { useNavigate } from 'react-router-dom';

type SwfItemsTableProps = {
  items: SwfItem[];
};

export const SwfItemsTable = ({ items }: SwfItemsTableProps) => {
  const navigate = useNavigate();
  const definitionLink = useRouteRef(definitionsRouteRef);

  interface Row {
    id: string;
    title: string;
  }

  const columns: TableColumn[] = [{ title: 'Title', field: 'title' }];
  const data: Row[] = items.map(item => {
    return {
      id: item.id,
      title: item.title,
    };
  });

  const doView = (rowData: Row) => {
    navigate(definitionLink({ swfId: rowData.id }));
  };

  return (
    <Table
      title="Definitions"
      options={{ search: false, paging: false, actionsColumnIndex: 1 }}
      columns={columns}
      data={data}
      actions={[
        {
          icon: () => <PlayArrow />,
          tooltip: 'Execute',
          disabled: true,
          onClick: (event, rowData) => {
            // eslint-disable-next-line no-console
            console.log(event, rowData);
          },
        },
        {
          icon: () => <Subscriptions />,
          tooltip: 'Instances',
          disabled: true,
          onClick: (event, rowData) => {
            // eslint-disable-next-line no-console
            console.log(event, rowData);
          },
        },
        {
          icon: () => <Pageview />,
          tooltip: 'View',
          onClick: (_, rowData) => doView(rowData as Row),
        },
      ]}
    />
  );
};

export const SWFDefinitionsListComponent = () => {
  const swfApi = useApi(swfApiRef);
  const { value, error, loading } = useAsync(async (): Promise<SwfItem[]> => {
    const data = await swfApi.listSwfs();
    return data.items;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return <SwfItemsTable items={value || []} />;
};
