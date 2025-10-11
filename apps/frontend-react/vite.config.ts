/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend-react',
  server: {
    port: 4300,
    host: 'localhost',
    proxy: {
      '/api/auth': 'http://localhost:3000',
      '/api/users': 'http://localhost:3001',
      '/api/boards': 'http://localhost:3002',
      '/api/columns': 'http://localhost:3002',
      '/api/tasks': 'http://localhost:3002',
      '/tasks': {
        target: 'ws://localhost:3003',
        ws: true,
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4300,
    host: 'localhost'
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/apps/frontend-react',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  test: {
    name: 'frontend-react',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/frontend-react',
      provider: 'v8' as const
    }
  }
}));
