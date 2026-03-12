<script setup>
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isDark = inject('isDark')
const { t } = useI18n()

const isSignup = ref(false)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const signupSuccess = ref(false)

async function handleSubmit() {
  error.value = ''
  signupSuccess.value = false

  if (!email.value || !password.value) return

  if (isSignup.value && password.value !== confirmPassword.value) {
    error.value = t('auth.passwordMismatch')
    return
  }

  loading.value = true
  try {
    if (isSignup.value) {
      await authStore.signup(email.value, password.value)
      signupSuccess.value = true
    } else {
      await authStore.login(email.value, password.value)
      router.push('/')
    }
  } catch (err) {
    error.value = isSignup.value ? t('auth.signupFailed') : t('auth.loginFailed')
  } finally {
    loading.value = false
  }
}

function toggleMode() {
  isSignup.value = !isSignup.value
  error.value = ''
  signupSuccess.value = false
}
</script>

<template>
  <div class="login-page">
    <div class="login-card card">
      <div class="login-header">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        <h1>HSLab Finance</h1>
      </div>

      <h2 class="login-title">{{ isSignup ? t('auth.signup') : t('auth.login') }}</h2>

      <div v-if="signupSuccess" class="success-message">
        {{ t('auth.checkEmail') }}
      </div>

      <form v-else @submit.prevent="handleSubmit" class="login-form">
        <div class="form-group">
          <label>{{ t('auth.email') }}</label>
          <input
            v-model="email"
            type="email"
            class="input"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label>{{ t('auth.password') }}</label>
          <input
            v-model="password"
            type="password"
            class="input"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="isSignup" class="form-group">
          <label>{{ t('auth.confirmPassword') }}</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="input"
            autocomplete="new-password"
            required
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
          {{ isSignup ? t('auth.signupButton') : t('auth.loginButton') }}
        </button>
      </form>

      <button class="switch-btn" @click="toggleMode">
        {{ isSignup ? t('auth.switchToLogin') : t('auth.switchToSignup') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 36px;
}

.login-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}

.login-header h1 {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.login-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 24px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.login-btn {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 4px;
}

.error-message {
  color: var(--danger);
  font-size: 13px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
}

.success-message {
  color: var(--success);
  font-size: 14px;
  padding: 12px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: var(--radius-sm);
  text-align: center;
  margin-bottom: 16px;
}

.switch-btn {
  display: block;
  width: 100%;
  margin-top: 16px;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px;
}

.switch-btn:hover {
  text-decoration: underline;
}
</style>
