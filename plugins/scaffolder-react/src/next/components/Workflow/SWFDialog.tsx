/*
 * Copyright 2022 The Backstage Authors
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
import { Dialog, DialogTitle } from '@material-ui/core';
import { ChannelType } from '@kie-tools-core/editor/dist/api';
import { EmbeddedEditor } from '@kie-tools-core/editor/dist/embedded';
import { useServerlessWorkflowDiagramEditor } from '@backstage/plugin-swf';

type SWFDialogProps = {
  name: string;
  title: string;
  open: boolean;
  close: () => void;
};
export const SWFDialog = (props: SWFDialogProps): JSX.Element | null => {
  const { name, title, open, close } = props;

  const { swfFile, swfEditorRef, swfEditorEnvelopeLocator } =
    useServerlessWorkflowDiagramEditor(name);

  return (
    <Dialog onClose={_ => close()} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <div style={{ height: '500px', width: '500px', padding: '10px' }}>
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
    </Dialog>
  );
};
