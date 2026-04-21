import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// Mounts the Express API (server/api.ts) as middleware on the Vite dev
// server so the whole project runs on a single port. No proxy, no second
// process. The API is loaded lazily via Vite's SSR loader so edits to
// server code are picked up on restart.
function expressApiPlugin(): Plugin {
  return {
    name: 'express-api-middleware',
    async configureServer(server) {
      const mod = await server.ssrLoadModule('/server/api.ts');
      const app = (mod as { app: import('express').Express }).app;
      server.middlewares.use(app);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
