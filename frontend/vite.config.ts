import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    target: 'es2020'
  },
  resolve: {
    alias: {
      // This is a workaround for a potential Vite issue where it cannot resolve the package.
      'react-i18next': path.resolve(__dirname, 'node_modules/react-i18next/dist/es/index.js'),
    },
  },
})
