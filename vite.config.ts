import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

/**
 * Vite's dev server does not run Vercel serverless functions, so /api/* used to
 * fall through to the SPA fallback and return index.html. Callers then blew up
 * on res.json(). This runs the real handler in-process instead, so /free-audit
 * behaves locally the way it does in production.
 */
function vercelApiDev(env: Record<string, string>): Plugin {
  return {
    name: 'vercel-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const parsed = new URL(req.url, 'http://localhost');
        const route = parsed.pathname.slice('/api/'.length).replace(/\.js$/, '');
        // Mirror Vercel: files starting with _ are modules, not endpoints.
        if (!route || route.startsWith('_') || route.includes('..')) return next();

        // Server-side vars live in .env but are never exposed to the client
        // bundle, so hand them to the handler the way Vercel would.
        for (const k of ['PAGESPEED_API_KEY', 'VITE_PAGESPEED_API_KEY']) {
          if (env[k] && !process.env[k]) process.env[k] = env[k];
        }

        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };

        try {
          const mod = await server.ssrLoadModule(`/api/${route}.js`);
          const handler = mod.default;
          if (typeof handler !== 'function') return next();

          await handler(
            {method: req.method, query: Object.fromEntries(parsed.searchParams), headers: req.headers},
            {
              setHeader: (k: string, v: string) => res.setHeader(k, v),
              status(code: number) {
                res.statusCode = code;
                return this;
              },
              json(body: unknown) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(body));
                return this;
              },
            },
          );
        } catch (err) {
          server.config.logger.error(`[vercel-api-dev] /api/${route} failed: ${err}`);
          send(500, {error: 'dev_handler_failed', detail: String(err)});
        }
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), vercelApiDev(env)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion': ['motion'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
