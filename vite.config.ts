import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Middleware điều hướng an toàn cho link /go/:code trên môi trường dev local
function localGoRedirectPlugin(): Plugin {
  return {
    name: 'local-go-redirect',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/go/')) {
          const code = req.url.replace(/^\/go\//, '').split('?')[0];
          const localMap: Record<string, string> = {
            'proj-openlab-3d': '/simulations/openlab-3d/index.html',
            'proj-khucxa-pxtp': '/simulations/khucxa-pxtp/index.html',
            'proj-1741697206385': 'https://donghobamgiay.netlify.app',
          };
          const targetUrl = localMap[code];
          if (targetUrl) {
            res.writeHead(302, { Location: targetUrl });
            res.end();
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localGoRedirectPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
    },
  };
});
