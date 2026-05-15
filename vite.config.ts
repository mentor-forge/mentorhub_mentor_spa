import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: {{repo.port}},
    proxy: {
      '/api': {
        target: 'http://localhost:{{repo.port - 1}}',
        changeOrigin: true
      }
    }
  }
})

