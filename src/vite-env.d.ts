/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IDP_LOGIN_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Type definitions for runtime-injected API configuration (container mode)
declare global {
  interface Window {
    API_HOST?: string
    API_PORT?: string
  }
}

