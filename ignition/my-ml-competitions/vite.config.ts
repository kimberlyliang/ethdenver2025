import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['process', 'buffer', 'util', 'stream', 'events', 'path', 'querystring'],
      globals: {
        process: true,
        Buffer: true,
      },
    }),
  ],
  define: {
    'global': 'globalThis',
  },
});
