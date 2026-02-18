import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
7
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://airstride0-3backend-11.onrender.com/', // backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // remove "/api" prefix
      },
    },
  },
})
