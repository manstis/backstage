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

module.exports = () => {
  return {
    mode: 'development',
    devtool: 'inline-source-map',
    ignoreWarnings: [/Failed to parse source map/],
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          use: [require.resolve('source-map-loader')],
        },
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    },
    output: {
      path: path.resolve('./dist'),
      filename: '[name].js',
      chunkFilename: '[name].bundle.js',
      sourceMapFilename: '[name].js.map',
    },
    resolve: {
      // Required for GitHub.dev and `minimatch`, as Webpack 5 doesn't add polyfills automatically anymore.
      fallback: {
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        fs: false,
        child_process: false,
        net: false,
        buffer: require.resolve('buffer/'),
        querystring: require.resolve('querystring-es3'),
      },
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      modules: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(__dirname, '../../node_modules'),
      ],
    },
  };
};
