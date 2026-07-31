import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/** Load container runtime config before the app module so spa_utils reads IDP_LOGIN_URI. */
function injectRuntimeConfig() {
  return {
    name: 'inject-runtime-config',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        return html.replace(
          '<head>',
          `<head>
    <script>window.__MENTORHUB_RUNTIME__=window.__MENTORHUB_RUNTIME__||{};</script>
    <script src="/runtime-config.js"></script>`
        )
      },
    },
  }
}

export default defineConfig({
  plugins: [vue(), injectRuntimeConfig()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8392,
    proxy: {
      '/api': {
        target: 'http://localhost:8391',
        changeOrigin: true
      }
    }
  }
})
