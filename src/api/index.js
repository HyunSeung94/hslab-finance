import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
})

api.interceptors.request.use((config) => {
  try {
    const authStore = useAuthStore()
    const token = authStore.session?.access_token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch (e) {
    // pinia not ready yet
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        const authStore = useAuthStore()
        authStore.logout()
      } catch (e) {}
    }
    return Promise.reject(error)
  }
)

export default api
