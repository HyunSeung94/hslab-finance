<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const { t } = useI18n()

const error = ref('')
const socialLoading = ref('')

async function handleSocialLogin(provider) {
  socialLoading.value = provider
  error.value = ''
  try {
    await authStore.loginWithProvider(provider)
  } catch (err) {
    error.value = t('auth.loginFailed')
  } finally {
    socialLoading.value = ''
  }
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

      <h2 class="login-title">{{ t('auth.login') }}</h2>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="social-buttons">
        <button class="btn social-btn kakao-btn" @click="handleSocialLogin('kakao')" :disabled="!!socialLoading">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1C4.58 1 1 3.79 1 7.21c0 2.17 1.45 4.08 3.64 5.18-.16.56-.58 2.03-.66 2.34-.1.39.14.38.3.28.12-.08 1.94-1.32 2.73-1.86.64.09 1.3.14 1.99.14 4.42 0 8-2.79 8-6.23S13.42 1 9 1z" fill="#000"/>
          </svg>
          <span v-if="socialLoading === 'kakao'" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
          <span v-else>{{ t('auth.loginWithKakao') }}</span>
        </button>

        <button class="btn social-btn google-btn" @click="handleSocialLogin('google')" :disabled="!!socialLoading">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          <span v-if="socialLoading === 'google'" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
          <span v-else>{{ t('auth.loginWithGoogle') }}</span>
        </button>
      </div>
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

.error-message {
  color: var(--danger);
  font-size: 13px;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
  margin-bottom: 16px;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: opacity 0.15s;
}

.social-btn:hover {
  opacity: 0.85;
}

.social-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.kakao-btn {
  background: #FEE500;
  color: #000;
  border-color: #FEE500;
}

.google-btn {
  background: #fff;
  color: #333;
}
</style>
