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
import {
  actions_open_api_file,
  actions_open_api_file_path,
  empty_definition,
} from '@backstage/plugin-swf-common';
import { SwfLanguageService } from './SwfLanguageService';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver-types';
import { Notification } from '@kie-tools-core/notifications/dist/api';
import { SwfLanguageServiceChannelApiImpl } from './SwfLanguageServiceChannelApiImpl';
import { parseApiContent } from '@kie-tools/serverless-workflow-service-catalog/dist/channel';
import { SwfCatalogSourceType } from '@kie-tools/serverless-workflow-service-catalog/dist/api/types';
import { SwfServiceCatalogService } from '@kie-tools/serverless-workflow-service-catalog/dist/api';
import { SwfCombinedEditorChannelApiImpl } from '@kie-tools/serverless-workflow-combined-editor/dist/impl';
import { ServerlessWorkflowCombinedEditorChannelApi } from '@kie-tools/serverless-workflow-combined-editor/dist/api';

export const useServerlessWorkflowCombinedEditor = (
  swfId: string | undefined,
): {
  swfFile: EmbeddedEditorFile | undefined;
  swfEditor: EmbeddedEditorRef | undefined;
  swfEditorRef: (node: EmbeddedEditorRef) => void;
  swfEditorEnvelopeLocator: EditorEnvelopeLocator;
  swfEditorApi: ServerlessWorkflowCombinedEditorChannelApi | undefined;
  validate: () => Promise<Notification[]>;
} => {
  const swfApi = useApi(swfApiRef);
  const { editor, editorRef } = useEditorRef();
  const [swfFile, setSwfFile] = useState<EmbeddedEditorFile>();
  const [services, setServices] = useState<SwfServiceCatalogService[]>([]);

  useEffect(() => {
    swfApi.getActionsSchema().then(schema => {
      const service = parseApiContent({
        serviceFileContent: JSON.stringify(schema),
        serviceFileName: actions_open_api_file,
        source: {
          type: SwfCatalogSourceType.LOCAL_FS,
          absoluteFilePath: actions_open_api_file_path,
        },
      });
      setServices([service]);
    });
  }, [swfApi]);

  const swfLanguageService = useMemo(() => {
    if (!swfFile) {
      return;
    }
    const devWebAppSwfLanguageService = new SwfLanguageService(services);
    // eslint-disable-next-line consistent-return
    return devWebAppSwfLanguageService.getLs(swfFile.path!);
  }, [swfFile, services]);

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
    return new SwfCombinedEditorChannelApiImpl(
      defaultApiImpl,
      undefined,
      undefined,
      swfLanguageServiceChannelApiImpl,
    );
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
