import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles' 
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#2E7D8C',
          secondary: '#5E5240',
          accent: '#32B8C6',
          error: '#C01533',
          warning: '#A84D2F',
          success: '#2E7D8C',
          info: '#626C71'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#32B8C6',
          secondary: '#C69B7B',
          accent: '#50B8C6',
          error: '#FF5459',
          warning: '#E68161',
          success: '#50B8C6',
          info: '#A7B1B6'
        }
      }
    }
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(vuetify)
app.use(pinia)

app.mount('#app')
