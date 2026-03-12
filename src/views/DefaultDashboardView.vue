<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '../api'

const { t } = useI18n()
const stocks = ref([])
const loading = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const showResults = ref(false)

async function fetchDefaultStocks() {
  loading.value = true
  try {
    const { data } = await api.get('/watchlist/default')
    stocks.value = data.watchlist || []
  } catch (error) {
    console.error('Failed to fetch default stocks:', error)
  } finally {
    loading.value = false
  }
}

async function searchStocks() {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    showResults.value = false
    return
  }
  searching.value = true
  showResults.value = true
  try {
    const { data } = await api.get('/stocks/search', { params: { keyword: searchQuery.value } })
    searchResults.value = data
  } catch (error) {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

async function addStock(result) {
  try {
    const { data } = await api.post('/watchlist/default', { symbol: result.symbol, name: result.name })
    stocks.value.unshift({ id: data.id, symbol: data.symbol, name: data.name })
    searchQuery.value = ''
    searchResults.value = []
    showResults.value = false
  } catch (error) {
    console.error('Failed to add:', error)
  }
}

async function removeStock(stock) {
  try {
    await api.delete(`/watchlist/default/${stock.id}`)
    stocks.value = stocks.value.filter(s => s.id !== stock.id)
  } catch (error) {
    console.error('Failed to remove:', error)
  }
}

function closeSearch() {
  setTimeout(() => { showResults.value = false }, 200)
}

let searchTimer = null
function handleInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchStocks, 300)
}

onMounted(fetchDefaultStocks)
</script>

<template>
  <div class="container">
    <div class="page-header">
      <router-link to="/" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {{ t('stock.backToDashboard') }}
      </router-link>
      <h1 class="page-title">{{ t('dashboard.defaultTitle') }}</h1>
      <p class="page-subtitle">{{ t('dashboard.defaultSubtitle') }}</p>
    </div>

    <!-- Search -->
    <div class="search-section">
      <div class="search-wrapper">
        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          v-model="searchQuery"
          @input="handleInput"
          @focus="searchQuery && (showResults = true)"
          @blur="closeSearch"
          class="input search-input"
          :placeholder="t('dashboard.searchPlaceholder')"
        />
      </div>

      <div v-if="showResults" class="search-dropdown">
        <div v-if="searching" class="search-loading">
          <span class="spinner"></span> {{ t('dashboard.searching') }}
        </div>
        <div v-else-if="searchResults.length === 0 && searchQuery" class="search-empty">
          {{ t('dashboard.noResults', { query: searchQuery }) }}
        </div>
        <div
          v-for="result in searchResults"
          :key="result.symbol"
          class="search-result-item"
          @mousedown.prevent="addStock(result)"
        >
          <div class="result-info">
            <span class="result-symbol">{{ result.symbol }}</span>
            <span class="result-name">{{ result.name }}</span>
          </div>
          <span class="result-add">{{ t('dashboard.add') }}</span>
        </div>
      </div>
    </div>

    <!-- Stock List -->
    <div v-if="loading" class="loading-container">
      <span class="spinner"></span>
    </div>

    <div v-else-if="stocks.length > 0" class="stock-list">
      <div v-for="stock in stocks" :key="stock.id" class="stock-item card">
        <div class="stock-info">
          <span class="stock-name">{{ stock.name }}</span>
          <span class="stock-symbol">{{ stock.symbol }}</span>
        </div>
        <button class="btn-icon remove-btn" @click="removeStock(stock)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>기본 종목이 없습니다. 위에서 검색하여 추가하세요.</p>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 13px;
  margin-bottom: 12px;
}

.back-link:hover {
  color: var(--accent);
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: 4px;
}

.search-section {
  position: relative;
  margin-bottom: 28px;
  max-width: 520px;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 42px;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  max-height: 320px;
  overflow-y: auto;
}

.search-loading,
.search-empty {
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-result-item:hover {
  background: var(--bg-hover);
}

.result-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-symbol {
  font-weight: 700;
  font-size: 14px;
}

.result-name {
  color: var(--text-secondary);
  font-size: 13px;
}

.result-add {
  font-size: 13px;
  color: var(--accent);
  font-weight: 600;
}

.stock-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 520px;
}

.stock-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
}

.stock-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stock-name {
  font-weight: 600;
  font-size: 15px;
}

.stock-symbol {
  color: var(--text-secondary);
  font-size: 13px;
}

.remove-btn {
  color: var(--text-muted);
  transition: color 0.15s;
}

.remove-btn:hover {
  color: var(--danger);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
