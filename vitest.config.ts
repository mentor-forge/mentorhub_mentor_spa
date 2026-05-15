import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/main.ts',
        'src/App.vue',
        'src/vite-env.d.ts',
        'src/plugins/**',
        'src/pages/**',
        'src/router/**',
        'src/stores/**',
        '**/*.config.ts',
        '**/dist/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        'src/api/types.ts', // Type-only file, cannot have coverage
      ],
      thresholds: {
        'src/api/**': {
          lines: 90,
          functions: 90,
          branches: 75,
          statements: 90,
        },
        'src/composables/**': {
          lines: 90,
          functions: 90,
          branches: 60,
          statements: 90,
        },
        'src/components/**': {
          lines: 90,
          functions: 90,
          branches: 85,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
