<script setup>
import { ref, provide, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { setLocale, getLocale } from './i18n'

const router = useRouter()
const { t } = useI18n()

const isDark = ref(localStorage.getItem('theme') !== 'light')
const currentLocale = ref(getLocale())

provide('isDark', isDark)

watchEffect(() => {
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

function toggleTheme() {
  isDark.value = !isDark.value
}

function toggleLocale() {
  const next = currentLocale.value === 'kr' ? 'en' : 'kr'
  setLocale(next)
  currentLocale.value = next
}
</script>

<template>
  <div class="app-layout">
    <header class="navbar">
      <div class="navbar-inner container">
        <router-link to="/" class="navbar-brand">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#3b82f6"/>
            <path d="M7 18L11 12L15 15L21 8" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="brand-text">{{ t('nav.brand') }}</span>
        </router-link>

        <nav class="navbar-links">
          <router-link to="/" class="nav-link" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            {{ t('nav.dashboard') }}
          </router-link>
          <router-link to="/predictions" class="nav-link" active-class="active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            {{ t('nav.predictions') }}
          </router-link>
        </nav>

        <div class="navbar-actions">
          <button class="btn-icon lang-toggle" @click="toggleLocale" :title="currentLocale === 'kr' ? 'English' : '한국어'">
            {{ currentLocale === 'kr' ? 'EN' : 'KR' }}
          </button>
          <button class="btn-icon theme-toggle" @click="toggleTheme" :title="isDark ? t('nav.lightMode') : t('nav.darkMode')">
            <svg v-if="isDark" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(12px);
}

.navbar-inner {
  display: flex;
  align-items: center;
  height: 56px;
  gap: 32px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-primary);
  flex-shrink: 0;
}

.brand-text {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.3px;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.nav-link.active {
  color: var(--accent);
  background: rgba(59, 130, 246, 0.1);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.lang-toggle {
  width: 36px;
  height: 36px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.theme-toggle {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .navbar-inner {
    gap: 16px;
  }

  .brand-text {
    display: none;
  }
}
</style>
