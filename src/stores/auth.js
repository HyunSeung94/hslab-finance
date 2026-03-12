import { defineStore } from 'pinia'
import { supabase } from '../lib/supabase'
import router from '../router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.session,
    userId: (state) => state.user?.id || null,
    userEmail: (state) => state.user?.email || '',
  },

  actions: {
    async init() {
      this.loading = true
      try {
        const { data: { session } } = await supabase.auth.getSession()
        this.session = session
        this.user = session?.user || null

        supabase.auth.onAuthStateChange((_event, session) => {
          this.session = session
          this.user = session?.user || null
        })
      } catch (error) {
        console.error('Auth init failed:', error)
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      this.session = data.session
      this.user = data.user
      return data
    },

    async signup(email, password) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      return data
    },

    async logout() {
      await supabase.auth.signOut()
      this.session = null
      this.user = null
      router.push('/login')
    },
  },
})
