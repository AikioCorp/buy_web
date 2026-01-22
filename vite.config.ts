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
})
