<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStockStore } from '../stores/stock'
import StockCard from '../components/StockCard.vue'
import api from '../api'

const { t } = useI18n()
const store = useStockStore()
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const showResults = ref(false)
const lastUpdated = ref(null)
const refreshMinutes = ref(parseInt(localStorage.getItem('refreshInterval') || '5'))
let refreshInterval = null

function updateTimestamp() {
  lastUpdated.value = new Date().toISOString()
}

const lastUpdatedFormatted = computed(() => {
  if (!lastUpdated.value) return ''
  const d = new Date(lastUpdated.value)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
})

async function refreshAllPrices() {
  await Promise.all(
    store.watchlist.map(stock => store.fetchStockPrice(stock.symbol))
  )
  updateTimestamp()
}

function startInterval() {
  if (refreshInterval) clearInterval(refreshInterval)
  refreshInterval = setInterval(() => {
    refreshAllPrices()
  }, refreshMinutes.value * 60 * 1000)
}

function changeInterval(minutes) {
  refreshMinutes.value = minutes
  localStorage.setItem('refreshInterval', String(minutes))
  startInterval()
}

onMounted(async () => {
  await store.fetchWatchlist()
  updateTimestamp()
  startInterval()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

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
    console.error('Search failed:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

async function addStock(result) {
  try {
    await store.addStock(result.symbol, result.name)
    searchQuery.value = ''
    searchResults.value = []
    showResults.value = false
  } catch (error) {
    console.error('Failed to add stock:', error)
  }
}

async function removeStock(symbol) {
  await store.removeStock(symbol)
}

function closeSearch() {
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

let searchTimer = null
function handleInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(searchStocks, 300)
}
</script>

<template>
  <div class="container">
    <div class="dashboard-header">
      <div>
        <h1 class="page-title">{{ t('dashboard.title') }}</h1>
        <p class="page-subtitle">{{ t('dashboard.subtitle') }}</p>
      </div>
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

      <!-- Search Results Dropdown -->
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

    <!-- Last Updated & Interval -->
    <div v-if="lastUpdated" class="update-info">
      <span class="update-text">{{ t('lastUpdate') }}: {{ lastUpdatedFormatted }}</span>
      <div class="interval-selector">
        <button
          v-for="min in [5, 10, 15, 20]"
          :key="min"
          :class="['btn', 'btn-sm', 'interval-btn', { active: refreshMinutes === min }]"
          @click="changeInterval(min)"
        >
          {{ min }}{{ t('dashboard.minuteShort') }}
        </button>
      </div>
      <button class="btn btn-secondary btn-sm refresh-btn" @click="refreshAllPrices">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
        {{ t('refresh') }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.watchlist.length === 0" class="loading-container">
      <span class="spinner"></span>
      {{ t('dashboard.loadingWatchlist') }}
    </div>

    <!-- Watchlist Grid -->
    <div v-else-if="store.watchlist.length > 0" class="watchlist-grid">
      <StockCard
        v-for="stock in store.watchlist"
        :key="stock.symbol"
        :stock="stock"
        @remove="removeStock"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      <h3>{{ t('dashboard.emptyTitle') }}</h3>
      <p>{{ t('dashboard.emptyDesc') }}</p>
    </div>
  </div>
</template>

<style scoped>
.dashboard-header {
  margin-bottom: 24px;
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

.update-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.update-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.interval-selector {
  display: flex;
  gap: 4px;
}

.interval-btn {
  padding: 3px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.interval-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 4px 12px;
}

.watchlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  max-width: 360px;
  margin: 0 auto;
}

@media (max-width: 640px) {
  .watchlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>
