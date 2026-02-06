import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@buymore/ui': path.resolve(__dirname, './src/lib/ui'),
      '@buymore/api-client': path.resolve(__dirname, './src/lib/api-client'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Local backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    allowedHosts: ['buyweb-production.up.railway.app'],
  },
})
