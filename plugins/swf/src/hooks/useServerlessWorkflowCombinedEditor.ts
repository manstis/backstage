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
import { useApi } from '@backstage/core-plugin-api';
import {
  EmbeddedEditorRef,
  useEditorRef,
} from '@kie-tools-core/editor/dist/embedded';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmbeddedEditorFile } from '@kie-tools-core/editor/dist/channel';
import {
  EditorEnvelopeLocator,
  EnvelopeContentType,
  EnvelopeMapping,
} from '@kie-tools-core/editor/dist/api';
import { swfApiRef } from '@backstage/plugin-swf';

export const useServerlessWorkflowCombinedEditor = (
  swfId: string | undefined,
  workflowType: string | undefined,
): {
  swfFile: EmbeddedEditorFile | undefined;
  swfEditor: EmbeddedEditorRef | undefined;
  swfEditorRef: (node: EmbeddedEditorRef) => void;
  swfEditorEnvelopeLocator: EditorEnvelopeLocator;
} => {
  const swfApi = useApi(swfApiRef);
  const { editor, editorRef } = useEditorRef();
  const [swfFile, setSwfFile] = useState<EmbeddedEditorFile>();

  const setContent = useCallback((path: string, content: string) => {
    setSwfFile({
      path: path,
      getFileContents: async () => content,
      isReadOnly: false,
      fileExtension: 'sw.json',
      fileName: 'fileName.sw.json',
    });
  }, []);

  const swfEditorEnvelopeLocator = useMemo(
    () =>
      new EditorEnvelopeLocator(window.location.origin, [
        new EnvelopeMapping({
          type: 'swf',
          filePathGlob: '**/*.sw.json',
          resourcesPathPrefix: '',
          envelopeContent: {
            type: EnvelopeContentType.PATH,
            path: 'serverless-workflow-combined-editor-envelope.html',
          },
        }),
      ]),
    [],
  );

  useEffect(() => {
    if (swfId && workflowType === 'serverless-workflow') {
      swfApi.getSwf(swfId).then(value => {
        setContent('fileName.sw.json', value.definition);
      });
    }
  }, [swfApi, setContent, swfId, workflowType]);

  return {
    swfFile: swfFile,
    swfEditor: editor,
    swfEditorRef: editorRef,
    swfEditorEnvelopeLocator: swfEditorEnvelopeLocator,
  };
};
