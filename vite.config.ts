import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/apis': {
        target: 'https://api.crashtest.mthy.dev',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
