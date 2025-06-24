import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // Proxy Maya TASE API requests to avoid CORS issues
        '/api/maya': {
          target: 'https://maya.tase.co.il',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/maya/, ''),
          configure: (proxy) => {
            proxy.on('error', (err) => {
              console.error('[VITE-PROXY] ❌ Maya TASE API proxy error:', err.message);
            });
            proxy.on('proxyReq', (proxyReq, req) => {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[VITE-PROXY] 🔄 Proxying request: ${req.method} ${req.url}`);
              }
              // Add required headers based on the curl example
              proxyReq.setHeader('Accept', 'application/json, text/plain, */*');
              proxyReq.setHeader('Accept-Language', 'he-IL');
              proxyReq.setHeader('DNT', '1');
              proxyReq.setHeader('Sec-Fetch-Dest', 'empty');
              proxyReq.setHeader('Sec-Fetch-Mode', 'cors');
              proxyReq.setHeader('Sec-Fetch-Site', 'same-origin');
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36');
            });
            proxy.on('proxyRes', (proxyRes, req) => {
              if (process.env.NODE_ENV === 'development') {
                const statusIcon = proxyRes.statusCode && proxyRes.statusCode < 400 ? '✅' : '❌';
                console.log(`[VITE-PROXY] ${statusIcon} Response: ${proxyRes.statusCode} for ${req.url}`);
              }
            });
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    // Define global constants
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    // Environment variables validation in development
    ...(mode === 'development' && {
      optimizeDeps: {
        include: ['@emotion/react', '@emotion/styled', '@mui/material/Tooltip'],
      },
    }),
  }
}) 