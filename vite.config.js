import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function zipApiPlugin() {
  return {
    name: 'zip-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/download-zip')) {
          try {
            const handler = (await import('./api/download-zip.js')).default;
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', async () => {
              req.body = body;
              res.status = (code) => { res.statusCode = code; return res; };
              res.send = (data) => res.end(data);
              res.json = (obj) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(obj));
              };
              await handler(req, res);
            });
            return;
          } catch (e) {
            console.error('Middleware zip error:', e);
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), zipApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts';
            if (id.includes('@supabase')) return 'vendor-supabase';
            if (id.includes('react')) return 'vendor-core';
          }
        },
      },
    },
  },
});


