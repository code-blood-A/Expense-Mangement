import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/transactions': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/budgets': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/notifications': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/analysis': {
        target: 'http://localhost:8086',
        changeOrigin: true,
      },
    },
  },
})
