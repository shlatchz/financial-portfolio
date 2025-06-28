import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // Proxy MCP API requests to Netlify dev server
      '/api/mcp': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        secure: false,
      },
      // Proxy Maya API requests to Netlify function
      '/api/maya': {
        target: 'http://localhost:8888/.netlify/functions/maya-proxy',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/maya/, ''),
      },
    },
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
  },
}) 