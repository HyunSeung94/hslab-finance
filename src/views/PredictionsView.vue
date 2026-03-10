<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStockStore } from '../stores/stock'

const { t } = useI18n()
const store = useStockStore()
const filterSymbol = ref('')

onMounted(async () => {
  await store.fetchPredictions()
})

const filteredPredictions = computed(() => {
  if (!filterSymbol.value) return store.predictions
  return store.predictions.filter(p =>
    p.symbol?.toLowerCase().includes(filterSymbol.value.toLowerCase()) ||
    p.name?.toLowerCase().includes(filterSymbol.value.toLowerCase())
  )
})

const stats = computed(() => store.predictionStats)

function signalClass(signal) {
  if (signal === '상승') return 'price-up'
  if (signal === '하락') return 'price-down'
  return 'price-neutral'
}

function resultBadge(pred) {
  if (pred.actualResult === null || pred.actualResult === undefined) {
    return { class: 'badge-neutral', text: t('predictions.pending') }
  }
  if (pred.isCorrect) {
    return { class: 'badge-success', text: t('predictions.correctResult') }
  }
  return { class: 'badge-danger', text: t('predictions.wrongResult') }
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatPrice(price) {
  if (price == null) return '-'
  return Number(price).toLocaleString('ko-KR')
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ t('predictions.title') }}</h1>
        <p class="page-subtitle">{{ t('predictions.subtitle') }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="card stat-card">
        <span class="stat-label">{{ t('predictions.totalPredictions') }}</span>
        <span class="stat-value">{{ stats.total }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">{{ t('predictions.evaluated') }}</span>
        <span class="stat-value">{{ stats.evaluated }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">{{ t('predictions.correct') }}</span>
        <span class="stat-value" style="color: var(--success);">{{ stats.correct }}</span>
      </div>
      <div class="card stat-card">
        <span class="stat-label">{{ t('predictions.accuracy') }}</span>
        <span class="stat-value" :style="{ color: stats.accuracy >= 50 ? 'var(--success)' : 'var(--danger)' }">
          {{ stats.accuracy }}%
        </span>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-section">
      <input
        v-model="filterSymbol"
        class="input filter-input"
        :placeholder="t('predictions.filterPlaceholder')"
      />
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="loading-container">
      <span class="spinner"></span>
      {{ t('predictions.loading') }}
    </div>

    <!-- Predictions Table -->
    <div v-else-if="filteredPredictions.length > 0" class="card table-container">
      <table>
        <thead>
          <tr>
            <th>{{ t('predictions.date') }}</th>
            <th>{{ t('predictions.stockName') }}</th>
            <th>{{ t('predictions.priceAtPrediction') }}</th>
            <th>{{ t('predictions.signal') }}</th>
            <th>{{ t('predictions.confidenceLabel') }}</th>
            <th>{{ t('predictions.result') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pred in filteredPredictions" :key="pred.id">
            <td class="date-cell">{{ formatDate(pred.createdAt) }}</td>
            <td>
              <div class="stock-cell">
                <span class="cell-symbol">{{ pred.symbol }}</span>
                <span class="cell-name">{{ pred.name }}</span>
              </div>
            </td>
            <td class="price-cell">{{ formatPrice(pred.price) }}</td>
            <td>
              <span :class="['signal-text', signalClass(pred.signal)]">
                {{ pred.signal }}
              </span>
            </td>
            <td>
              <span v-if="pred.confidence != null">{{ pred.confidence.toFixed(1) }}%</span>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <span :class="['badge', resultBadge(pred).class]">
                {{ resultBadge(pred).text }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
      <h3>{{ t('predictions.emptyTitle') }}</h3>
      <p>{{ t('predictions.emptyDesc') }}</p>
    </div>
  </div>
</template>

<style scoped>
.page-header {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 20px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.filter-section {
  margin-bottom: 16px;
  max-width: 360px;
}

.filter-input {
  font-size: 13px;
}

.date-cell {
  white-space: nowrap;
  color: var(--text-secondary);
  font-size: 13px;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.cell-symbol {
  font-weight: 700;
  font-size: 14px;
}

.cell-name {
  font-size: 12px;
  color: var(--text-secondary);
}

.price-cell {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.signal-text {
  font-weight: 700;
  font-size: 14px;
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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-value {
    font-size: 22px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
