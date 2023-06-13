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
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { swfApiRef } from '../../api';
import { SwfItem } from '@backstage/plugin-swf-common';
import {
  MermaidDiagram,
  Specification,
} from '@severlessworkflow/sdk-typescript';
import mermaid from 'mermaid';
import svgPanZoom from 'svg-pan-zoom';

export const SWFDefinitionViewerComponent = () => {
  const swfApi = useApi(swfApiRef);
  const [items, setItems] = useState<SwfItem[]>();

  useEffect(() => {
    swfApi.listSwfs().then(value => {
      setItems(value.items);
    });
  }, [swfApi]);

  const diagramContainerRef = useRef<HTMLDivElement>(null);
  const updateDiagram = useCallback((content: string) => {
    if (!diagramContainerRef.current) {
      return;
    }

    try {
      const workflow: Specification.Workflow =
        Specification.Workflow.fromSource(content);
      const mermaidSourceCode = workflow.states
        ? new MermaidDiagram(workflow).sourceCode()
        : '';

      if (mermaidSourceCode?.length > 0) {
        diagramContainerRef.current.innerHTML = mermaidSourceCode;
        diagramContainerRef.current.removeAttribute('data-processed');
        // @ts-ignore
        mermaid.init(diagramContainerRef.current);
        svgPanZoom(diagramContainerRef.current.getElementsByTagName('svg')[0], {
          controlIconsEnabled: true,
        });
        diagramContainerRef.current.getElementsByTagName(
          'svg',
        )[0].style.maxWidth = '';
        diagramContainerRef.current.getElementsByTagName(
          'svg',
        )[0].style.height = '100%';
      } else {
        diagramContainerRef.current.innerHTML =
          'Create a workflow to see its preview here.';
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (items !== undefined) {
      updateDiagram(items[0].definition);
    }
  }, [items, updateDiagram]);

  return (
    <div>
      <div
        style={{ height: '100%', textAlign: 'center', opacity: 1 }}
        ref={diagramContainerRef}
        className="mermaid"
      />
    </div>
  );
};
