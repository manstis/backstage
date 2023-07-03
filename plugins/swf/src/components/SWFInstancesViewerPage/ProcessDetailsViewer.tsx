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

import { InfoCard } from '@backstage/core-components';
import { Button, Link, Typography } from '@material-ui/core';
import Moment from 'react-moment';
import PlayCircleFilledWhiteRoundedIcon from '@material-ui/icons/PlayCircleFilledWhiteRounded';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import RemoveCircleRoundedIcon from '@material-ui/icons/RemoveCircleRounded';
import PauseCircleFilledRoundedIcon from '@material-ui/icons/PauseCircleFilledRounded';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import PublishIcon from '@material-ui/icons/Publish';
import GetAppIcon from '@material-ui/icons/GetApp';
import ItemDescriptor from './ItemDescriptor';
import {
  ProcessInstance,
  ProcessInstanceState,
} from '@backstage/plugin-swf-common';
import LaunchIcon from '@material-ui/icons/Launch';

interface ProcessDetailsViewerProps {
  selectedInstance: ProcessInstance | undefined;
}

const processInstanceIconCreator = (state: string) => {
  const render = (icon: JSX.Element, text: string) => {
    return (
      <p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {icon}
          <span style={{ paddingLeft: '8px' }}>{text}</span>
        </div>
      </p>
    );
  };

  switch (state) {
    case ProcessInstanceState.Active:
      return render(<PlayCircleFilledWhiteRoundedIcon />, 'Active');
    case ProcessInstanceState.Completed:
      return render(<CheckCircleIcon htmlColor="#3e8635" />, 'Complete');
    case ProcessInstanceState.Aborted:
      return render(<RemoveCircleRoundedIcon />, 'Aborted');
    case ProcessInstanceState.Suspended:
      return render(<PauseCircleFilledRoundedIcon />, 'Suspended');
    case ProcessInstanceState.Error:
      return render(<CancelOutlinedIcon color="error" />, 'Error');
    default:
      return <></>;
  }
};

const getProcessInstanceDescription = (processInstance: any) => {
  return {
    id: processInstance.id,
    name: processInstance.processName,
    description: processInstance.businessKey,
  };
};

export const ProcessDetailsViewer = (props: ProcessDetailsViewerProps) => {
  const { selectedInstance } = props;

  return (
    <InfoCard title="Details">
      {selectedInstance && (
        <div>
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            Name
          </Typography>
          <p>{selectedInstance?.processName}</p>
          {selectedInstance.businessKey && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Business key
              </Typography>
              <p>{selectedInstance?.businessKey}</p>
            </>
          )}
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            State
          </Typography>
          {processInstanceIconCreator(selectedInstance.state)}
          <Typography variant="caption" style={{ fontWeight: 'bold' }}>
            Id
          </Typography>
          <p>{selectedInstance?.id}</p>
          {selectedInstance.serviceUrl && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Endpoint
              </Typography>
              <Link href={selectedInstance.serviceUrl} target="_blank">
                {selectedInstance.serviceUrl}
              </Link>
              <LaunchIcon />
            </>
          )}
          {selectedInstance.start && (
            <div>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Start
              </Typography>
              <p>
                <Moment fromNow>{new Date(`${selectedInstance.start}`)}</Moment>
              </p>
            </div>
          )}
          {selectedInstance.lastUpdate && (
            <div>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Last Updated
              </Typography>
              <p>
                <Moment fromNow>
                  {new Date(`${selectedInstance.lastUpdate}`)}
                </Moment>
              </p>
            </div>
          )}
          {selectedInstance.end && (
            <div>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                End
              </Typography>
              <p>
                <Moment fromNow>{new Date(`${selectedInstance.end}`)}</Moment>
              </p>
            </div>
          )}
          {selectedInstance.parentProcessInstance && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Parent Process
              </Typography>
              <div>
                <Button
                  variant="contained"
                  startIcon={<PublishIcon />}
                  disabled
                >
                  <ItemDescriptor
                    itemDescription={getProcessInstanceDescription(
                      selectedInstance.parentProcessInstance,
                    )}
                  />
                </Button>
              </div>
            </>
          )}
          {selectedInstance?.childProcessInstances?.length && (
            <>
              <Typography variant="caption" style={{ fontWeight: 'bold' }}>
                Sub Processes
              </Typography>
              {selectedInstance?.childProcessInstances?.map(child => (
                <div key={child.id}>
                  <Button
                    variant="contained"
                    startIcon={<GetAppIcon />}
                    disabled
                  >
                    <ItemDescriptor
                      itemDescription={getProcessInstanceDescription(child)}
                    />
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </InfoCard>
  );
};
