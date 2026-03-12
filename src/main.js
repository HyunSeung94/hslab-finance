import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import App from './App.vue'
import './style.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)

// Auth 초기화 후 앱 마운트
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})
