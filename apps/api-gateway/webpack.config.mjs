import { NxAppWebpackPlugin } from '@nx/webpack/app-plugin.js';

import { join } from 'path';

export default {
  output: {
    path: join(
      new URL('.', import.meta.url).pathname,
      '../../dist/apps/api-gateway'
    ),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    })
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true
    })
  ]
};
