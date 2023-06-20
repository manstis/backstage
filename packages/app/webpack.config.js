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
const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const swEditor = require('@kie-tools/serverless-workflow-diagram-editor-assets');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: {
    'envelope/serverless-workflow-diagram-editor-envelope':
      './envelope/ServerlessWorkflowDiagramEditorEnvelopeApp.ts',
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      KOGITO_APP_VERSION: 'DEV',
      KOGITO_APP_NAME: 'Backstage SWF Plugin :: Editor',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: './envelope/serverless-workflow-diagram-editor-envelope.html',
          to: './envelope',
        },
        {
          from: swEditor.swEditorPath(),
          to: './editor',
          globOptions: { ignore: ['**/WEB-INF/**/*'] },
        },
      ],
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          mkdir: ['./public/swf/items/'],
          copy: [
            { source: './dist/editor', destination: './public/' },
            { source: './dist/envelope', destination: './public/swf/items/' },
            {
              source: './dist/envelope',
              destination: './public/create/templates/default/',
            },
          ],
        },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(tsx|ts)?$/,
        include: [path.resolve(__dirname, 'envelope')],
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.resolve('./tsconfig.json'),
              allowTsInNodeModules: true,
            },
          },
        ],
      },
      {
        test: /\.(css|sass|scss)$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve('../../node_modules/patternfly'),
          path.resolve('../../node_modules/@patternfly/patternfly'),
          path.resolve('../../node_modules/@patternfly/react-styles/css'),
          path.resolve(
            '../../node_modules/@patternfly/react-core/dist/styles/base.css',
          ),
          path.resolve(
            '../../node_modules/@patternfly/react-core/dist/esm/@patternfly/patternfly',
          ),
          path.resolve(
            '../../node_modules/@patternfly/react-core/node_modules/@patternfly/react-styles/css',
          ),
          path.resolve(
            '../../node_modules/@patternfly/react-table/node_modules/@patternfly/react-styles/css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/consoles-common/dist/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/components-common/dist/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/jobs-management/dist/envelope/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-details/dist/envelope/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/management-console-shared/dist/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-list/dist/envelope/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/task-console-shared/dist/envelope/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/task-form/dist/envelope/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/form-details/dist/envelope/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/form-displayer/dist/envelope/components/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-form/dist/envelope/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/workflow-form/dist/envelope/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-definition-list/dist/envelope/styles.css',
          ),
          path.resolve('../../node_modules/react-calendar/dist/Calendar.css'),
          path.resolve('../../node_modules/react-clock/dist/Clock.css'),
          path.resolve(
            '../../node_modules/react-datetime-picker/dist/DateTimePicker.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/form-details/dist/styles/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/workflow-form/dist/envelope/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/cloud-event-form/dist/envelope/styles.css',
          ),
          path.resolve(
            '../../node_modules/@kie-tools-core/guided-tour/dist/components',
          ),
          path.resolve(
            '../../node_modules/@kie-tools-core/editor/dist/envelope',
          ),
          path.resolve(
            '../../node_modules/@kie-tools/serverless-workflow-mermaid-viewer/dist/viewer',
          ),
        ],
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(svg|ttf|eot|woff|woff2)$/,
        include: [
          path.resolve('../../node_modules/patternfly/dist/fonts'),
          path.resolve(
            '../../node_modules/@patternfly/react-core/dist/styles/assets/fonts',
          ),
          path.resolve(
            '../../node_modules/@patternfly/react-core/dist/styles/assets/pficon',
          ),
          path.resolve(
            '../../node_modules/@patternfly/patternfly/assets/fonts',
          ),
          path.resolve(
            '../../node_modules/@patternfly/patternfly/assets/pficon',
          ),
          path.resolve('./src/static/'),
          path.resolve(
            '../../node_modules/@kogito-apps/consoles-common/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/components-common/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/jobs-management/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-details/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/custom-dashboard-view/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/management-console-shared/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-list/dist/static',
          ),
          path.resolve('../../node_modules/@kogito-apps/task-form/dist/static'),
          path.resolve(
            '../../node_modules/@kogito-apps/form-details/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/form-displayer/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-form/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-definition-list/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/custom-dashboard-view/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/process-monitoring/dist/static',
          ),
          path.resolve(
            '../../node_modules/@kogito-apps/workflow-form/dist/static',
          ),
          path.resolve(
            '../../node_modules/monaco-editor/esm/vs/base/browser/ui/codicons/codicon/codicon.ttf',
          ),
        ],
        use: {
          loader: 'file-loader',
          options: {
            // Limit at 50k. larger files emited into separate files
            limit: 5000,
            outputPath: 'fonts',
            name: '[name].[ext]',
          },
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: [
      path.resolve('../../node_modules'),
      path.resolve('./node_modules'),
      path.resolve('./src'),
    ],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, './tsconfig.json'),
      }),
    ],
    symlinks: false,
    cacheWithContext: false,
  },
};
