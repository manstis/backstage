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
import { Navigate, useNavigate } from 'react-router-dom';
import { stringifyEntityRef } from '@backstage/catalog-model';
import {
  alertApiRef,
  AnalyticsContext,
  useApi,
  useRouteRef,
  useRouteRefParams,
} from '@backstage/core-plugin-api';
import {
  scaffolderApiRef,
  useTemplateSecrets,
  type LayoutOptions,
  TemplateParameterSchema,
} from '@backstage/plugin-scaffolder-react';
import {
  FormProps,
  Workflow,
  NextFieldExtensionOptions,
} from '@backstage/plugin-scaffolder-react/alpha';
import { JsonValue } from '@backstage/types';
import { Header, Page } from '@backstage/core-components';
import { swfInstanceRouteRef } from '@backstage/plugin-swf';

import {
  rootRouteRef,
  scaffolderTaskRouteRef,
  selectedTemplateRouteRef,
} from '../../routes';

/**
 * @alpha
 */
export type TemplateWizardPageProps = {
  customFieldExtensions: NextFieldExtensionOptions<any, any>[];
  layouts?: LayoutOptions[];
  FormProps?: FormProps;
};

export const TemplateWizardPage = (props: TemplateWizardPageProps) => {
  const rootRef = useRouteRef(rootRouteRef);
  const taskRoute = useRouteRef(scaffolderTaskRouteRef);
  const swfInstanceRoute = useRouteRef(swfInstanceRouteRef);
  const { secrets } = useTemplateSecrets();
  const scaffolderApi = useApi(scaffolderApiRef);
  const navigate = useNavigate();
  const { templateName, namespace } = useRouteRefParams(
    selectedTemplateRouteRef,
  );
  const alertApi = useApi(alertApiRef);

  const templateRef = stringifyEntityRef({
    kind: 'Template',
    namespace,
    name: templateName,
  });

  const onCreate = async (
    values: Record<string, JsonValue>,
    manifest: TemplateParameterSchema,
  ) => {
    const { taskId } = await scaffolderApi.scaffold({
      templateRef,
      values,
      secrets,
    });
    if (manifest.type === 'serverless-workflow') {
      alertApi.post({
        severity: 'info',
        message: `Workflow ${taskId} has been started...`,
      });
      navigate(swfInstanceRoute({ instanceId: taskId }));
    } else {
      navigate(taskRoute({ taskId }));
    }
  };

  const onError = () => <Navigate to={rootRef()} />;

  return (
    <AnalyticsContext attributes={{ entityRef: templateRef }}>
      <Page themeId="website">
        <Header
          pageTitleOverride="Create a new component"
          title="Create a new component"
          subtitle="Create new software components using standard templates in your organization"
        />
        <Workflow
          namespace={namespace}
          templateName={templateName}
          onCreate={onCreate}
          onError={onError}
          extensions={props.customFieldExtensions}
          FormProps={props.FormProps}
          layouts={props.layouts}
        />
      </Page>
    </AnalyticsContext>
  );
};
