import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/** Load container runtime config before the app module so spa_utils reads IDP_LOGIN_URI. */
function injectRuntimeConfig(): Plugin {
  let base = '/'
  let isServe = false
  return {
    name: 'inject-runtime-config',
    configResolved(config) {
      base = config.base
      isServe = config.command === 'serve'
    },
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string) {
        // vite-ignore keeps Vite 7 from rewriting the already-prefixed src to /mentor/mentor/...
        const devAssetTag = isServe
          ? `\n    <script type="module" src="${base}assets/index-bundle.js" vite-ignore></script>`
          : ''
        return html.replace(
          '<head>',
          `<head>
    <script>window.__MENTORHUB_RUNTIME__=window.__MENTORHUB_RUNTIME__||{};</script>
    <script src="${base}runtime-config.js" vite-ignore></script>${devAssetTag}`
        )
      },
    },
  }
}

/** Dev server middleware to align cache headers, redirects, and mock asset routes with nginx */
function devDeploymentMiddleware(): Plugin {
  return {
    name: 'dev-deployment-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const rawUrl = req.url?.split('?')[0] || ''

        // 1. Redirect / and /mentor to /mentor/
        if (rawUrl === '' || rawUrl === '/' || rawUrl === '/mentor') {
          res.writeHead(302, { Location: '/mentor/' })
          res.end()
          return
        }

        // 2. Serve /runtime-config.js and /mentor/runtime-config.js with no-store
        if (rawUrl === '/runtime-config.js' || rawUrl === '/mentor/runtime-config.js') {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-store')
          res.end("window.__MENTORHUB_RUNTIME__ = Object.assign(window.__MENTORHUB_RUNTIME__ || {}, { IDP_LOGIN_URI: 'http://localhost:8080/login.html' });")
          return
        }

        // 3. Serve versioned assets with public, immutable caching
        if (rawUrl.startsWith('/mentor/assets/')) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
          res.end('// asset bundle')
          return
        }

        // 4. Ensure HTML and history fallback have no-store
        const origSetHeader = res.setHeader.bind(res)
        res.setHeader = (key: string, val: any) => {
          if (key.toLowerCase() === 'cache-control' && String(val).includes('no-cache')) {
            val = 'no-store'
          }
          return origSetHeader(key, val)
        }

        if (req.headers.accept?.includes('text/html') || rawUrl === '/mentor/' || (!rawUrl.includes('.') && rawUrl.startsWith('/mentor/'))) {
          res.setHeader('Cache-Control', 'no-store')
        }

        next()
      })
    },
  }
}

export default defineConfig({
  base: '/mentor/',
  plugins: [vue(), injectRuntimeConfig(), devDeploymentMiddleware()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 8392,
    proxy: {
      '/mentor/api': {
        target: 'http://localhost:8391',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mentor/, ''),
      },
      '/api': {
        target: 'http://localhost:8391',
        changeOrigin: true
      }
    }
  }
})
