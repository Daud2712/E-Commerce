import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
    ],
    base: './',
    esbuild: {
      target: 'es2020'
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
           target: (env.VITE_API_URL || 'http://localhost:5002').replace(/\/api\/?$/, ''),
          changeOrigin: true,
        },
      },
    },
  }
})
