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
  EmbeddedEditorChannelApiImpl,
  EmbeddedEditorRef,
  useEditorRef,
} from '@kie-tools-core/editor/dist/embedded';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  EmbeddedEditorFile,
  StateControl,
} from '@kie-tools-core/editor/dist/channel';
import {
  EditorEnvelopeLocator,
  EnvelopeContentType,
  EnvelopeMapping,
} from '@kie-tools-core/editor/dist/api';
import { swfApiRef } from '@backstage/plugin-swf';
import { empty_definition } from '@backstage/plugin-swf-common';
import { SwfLanguageService } from './SwfLanguageService';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';
import { Notification } from '@kie-tools-core/notifications/dist/api';
import { SwfTextEditorChannelApiImpl } from './SwfTextEditorChannelApiImpl';
import { ServerlessWorkflowTextEditorChannelApi } from '@kie-tools/serverless-workflow-text-editor/dist/api';
import { SwfLanguageServiceChannelApiImpl } from './SwfLanguageServiceChannelApiImpl';

export const useServerlessWorkflowCombinedEditor = (
  swfId: string | undefined,
): {
  swfFile: EmbeddedEditorFile | undefined;
  swfEditor: EmbeddedEditorRef | undefined;
  swfEditorRef: (node: EmbeddedEditorRef) => void;
  swfEditorEnvelopeLocator: EditorEnvelopeLocator;
  swfEditorApi: ServerlessWorkflowTextEditorChannelApi | undefined;
  validate: () => Promise<Notification[]>;
} => {
  const swfApi = useApi(swfApiRef);
  const { editor, editorRef } = useEditorRef();
  const [swfFile, setSwfFile] = useState<EmbeddedEditorFile>();

  const swfLanguageService = useMemo(() => {
    if (!swfFile) {
      return;
    }
    const devWebAppSwfLanguageService = new SwfLanguageService();
    // eslint-disable-next-line consistent-return
    return devWebAppSwfLanguageService.getLs(swfFile.path!);
  }, [swfFile]);

  const stateControl = useMemo(() => new StateControl(), []);

  const apiImpl = useMemo(() => {
    if (!swfFile || !swfLanguageService) {
      return;
    }

    const defaultApiImpl = new EmbeddedEditorChannelApiImpl(
      stateControl,
      swfFile,
      'en',
      {},
    );
    const swfLanguageServiceChannelApiImpl =
      new SwfLanguageServiceChannelApiImpl(swfLanguageService);

    // eslint-disable-next-line consistent-return
    return new SwfTextEditorChannelApiImpl({
      defaultApiImpl,
      swfLanguageServiceChannelApiImpl,
    });
  }, [swfFile, stateControl, swfLanguageService]);

  const onValidate = useCallback(async () => {
    if (!editor || !swfLanguageService || !swfFile) {
      return [];
    }

    const content = await editor.getContent();
    const lsDiagnostics = await swfLanguageService.getDiagnostics({
      content: content,
      uriPath: swfFile.path!,
    });

    const notifications: Notification[] = lsDiagnostics.map(
      (lsDiagnostic: Diagnostic) =>
        ({
          path: '', // empty to not group them by path, as we're only validating one file.
          severity:
            lsDiagnostic.severity === DiagnosticSeverity.Error
              ? 'ERROR'
              : 'WARNING',
          message: `${lsDiagnostic.message} [Line ${
            lsDiagnostic.range.start.line + 1
          }]`,
          type: 'PROBLEM',
          position: {
            startLineNumber: lsDiagnostic.range.start.line + 1,
            startColumn: lsDiagnostic.range.start.character + 1,
            endLineNumber: lsDiagnostic.range.end.line + 1,
            endColumn: lsDiagnostic.range.end.character + 1,
          },
        } as Notification),
    );

    return notifications;
  }, [editor, swfFile, swfLanguageService]);

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
            path: '/serverless-workflow-combined-editor-envelope.html',
          },
        }),
      ]),
    [],
  );

  useEffect(() => {
    if (swfId) {
      swfApi.getSwf(swfId).then(value => {
        setContent('fileName.sw.json', value.definition);
      });
    } else {
      setContent('fileName.sw.json', empty_definition);
    }
  }, [swfApi, setContent, swfId]);

  return {
    swfFile: swfFile,
    swfEditor: editor,
    swfEditorRef: editorRef,
    swfEditorEnvelopeLocator: swfEditorEnvelopeLocator,
    swfEditorApi: apiImpl,
    validate: onValidate,
  };
};
