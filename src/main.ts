import './initAuth'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import {
  editorConfigKey,
  type RuntimeEditorConfig,
} from '@mentor-forge/mentorhub_spa_utils'
import type { ComputedRef } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { useConfig } from './composables/useConfig'
import './styles/global-inputs.css'
import './styles/global-background.css'
import './styles/dashboard.css'
import './styles/schema-fields.css'

const app = createApp(App)
const pinia = createPinia()

const { config } = useConfig()
app.provide(
  editorConfigKey,
  config as unknown as ComputedRef<RuntimeEditorConfig | null>,
)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(VueQueryPlugin)

app.mount('#app')
