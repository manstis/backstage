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

import { InfoCard, Table } from '@backstage/core-components';
import { swfApiRef } from '../../api';
import { useApi, useRouteRefParams } from '@backstage/core-plugin-api';
import { swfInstanceRouteRef } from '../../routes';

interface ProcessInstancesTableProps {
  selectedInstance: Record<string, unknown> | undefined;
  setSelectedInstance: (instance: Record<string, unknown>) => void;
}

type Row = {
  pid: string;
  name: string;
  state: string;
};

export const ProcessInstancesTable = (props: ProcessInstancesTableProps) => {
  const swfApi = useApi(swfApiRef);
  const { instanceId } = useRouteRefParams(swfInstanceRouteRef);
  const [data, setData] = useState<Row[]>([]);
  const { selectedInstance, setSelectedInstance } = props;

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

  const loadInstance = useCallback(
    (pid: string | undefined) => {
      if (pid) {
        swfApi.getInstance(pid).then(value => {
          const processInstances: any[] = value.data.ProcessInstances as [];
          setSelectedInstance(processInstances[0]);
        });
      }
    },
    [swfApi, setSelectedInstance],
  );

  useEffect(() => {
    const selectedRowData = data.find(d => d.pid === instanceId);
    if (selectedRowData) {
      loadInstance(selectedRowData.pid);
    }
  }, [loadInstance, data, instanceId]);

  return (
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
            return rowData.pid === selectedInstance?.id
              ? { backgroundColor: '#a266e5' }
              : {};
          },
        }}
      />
    </InfoCard>
  );
};
