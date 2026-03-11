<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStockStore } from '../stores/stock'
import PriceChart from '../components/PriceChart.vue'
import api from '../api'

const route = useRoute()
const router = useRouter()
const store = useStockStore()
const isDark = inject('isDark')
const { t } = useI18n()

const symbol = computed(() => route.params.symbol)
const stockData = ref(null)
const priceHistory = ref([])
const intradayHistory = ref([])
const indicators = ref(null)
const prediction = ref(null)
const loading = ref(true)
const savingPrediction = ref(false)
const lastUpdated = ref(null)

onMounted(async () => {
  await loadStockData()
})

async function loadStockData() {
  loading.value = true
  try {
    const [stockRes, historyRes, intradayRes, indicatorRes, predRes] = await Promise.allSettled([
      api.get(`/stocks/price/${symbol.value}`),
      api.get(`/stocks/history/${symbol.value}`),
      api.get(`/stocks/intraday/${symbol.value}`),
      api.get(`/stocks/price/${symbol.value}/indicators`),
      api.get(`/stocks/price/${symbol.value}/prediction`)
    ])

    if (stockRes.status === 'fulfilled') {
      stockData.value = stockRes.value.data
      lastUpdated.value = stockRes.value.data.updated_at || new Date().toISOString()
    }
    if (historyRes.status === 'fulfilled') priceHistory.value = historyRes.value.data
    if (intradayRes.status === 'fulfilled') intradayHistory.value = intradayRes.value.data
    if (indicatorRes.status === 'fulfilled') indicators.value = indicatorRes.value.data
    if (predRes.status === 'fulfilled') prediction.value = predRes.value.data
  } catch (error) {
    console.error('Failed to load stock data:', error)
  } finally {
    loading.value = false
  }
}

const changeClass = computed(() => {
  if (!stockData.value?.change) return 'price-neutral'
  return stockData.value.change > 0 ? 'price-up' : 'price-down'
})

const changeSign = computed(() => {
  if (!stockData.value?.change) return ''
  return stockData.value.change > 0 ? '+' : ''
})

const intradayChartData = computed(() => {
  if (!intradayHistory.value.length) return null

  const labels = intradayHistory.value.map(p => p.timestamp.slice(11, 16))
  const prices = intradayHistory.value.map(p => p.price)
  const isUp = prices.length >= 2 && prices[prices.length - 1] >= prices[0]
  const lineColor = isUp ? '#ef4444' : '#3b82f6'

  return {
    labels,
    datasets: [{
      label: '가격',
      data: prices,
      borderColor: lineColor,
      backgroundColor: lineColor + '15',
      fill: true,
      tension: 0.3,
      pointRadius: 2,
      pointHitRadius: 10,
      borderWidth: 2
    }]
  }
})

const chartData = computed(() => {
  if (!priceHistory.value.length) return null

  const labels = priceHistory.value.map(p => p.date)
  const prices = priceHistory.value.map(p => p.close)
  const isUp = prices.length >= 2 && prices[prices.length - 1] >= prices[0]
  const lineColor = isUp ? '#ef4444' : '#3b82f6'

  return {
    labels,
    datasets: [{
      label: 'Close Price',
      data: prices,
      borderColor: lineColor,
      backgroundColor: lineColor + '15',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      pointHitRadius: 10,
      borderWidth: 2
    }]
  }
})

const signalClass = computed(() => {
  if (!prediction.value?.signal) return ''
  const s = prediction.value.signal
  if (s === '상승') return 'signal-up'
  if (s === '하락') return 'signal-down'
  return 'signal-neutral'
})

function formatPrice(price) {
  if (price == null) return '-'
  return Number(price).toLocaleString('ko-KR')
}

async function savePrediction() {
  if (!prediction.value) return
  savingPrediction.value = true
  try {
    await store.createPrediction({
      symbol: symbol.value,
      symbol_name: stockData.value?.name,
      direction: prediction.value.signal === '상승' ? 'up' : 'down',
      confidence: prediction.value.confidence,
      target_price: stockData.value?.price,
      indicators: indicators.value
    })
    alert(t('stock.savedSuccess'))
  } catch (error) {
    alert(t('stock.savedFail'))
  } finally {
    savingPrediction.value = false
  }
}
</script>

<template>
  <div class="container">
    <button class="btn btn-secondary back-btn" @click="router.push('/')">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      {{ t('stock.backToDashboard') }}
    </button>

    <div v-if="loading" class="loading-container">
      <span class="spinner"></span>
      {{ t('stock.loadingData') }}
    </div>

    <template v-else-if="stockData">
      <!-- Stock Header -->
      <div class="stock-header">
        <div class="stock-title">
          <h1>{{ stockData.name || symbol }}</h1>
          <span class="symbol-badge">{{ symbol }}</span>
        </div>
        <div class="stock-price-section">
          <span class="big-price">{{ formatPrice(stockData.price) }}</span>
          <span :class="['change-text', changeClass]">
            {{ changeSign }}{{ formatPrice(stockData.change) }}
            <span v-if="stockData.changePercent">
              ({{ changeSign }}{{ stockData.changePercent?.toFixed(2) }}%)
            </span>
          </span>
        </div>
        <div v-if="lastUpdated" class="last-updated-text">
          {{ t('lastUpdate') }}: {{ lastUpdated.slice(11, 19) }}
        </div>
      </div>

      <!-- Intraday Chart -->
      <div class="card mb-4" v-if="intradayChartData">
        <h3 class="section-title">{{ t('stock.intradayChart') }}</h3>
        <PriceChart :chart-data="intradayChartData" />
      </div>

      <!-- Daily Price Chart -->
      <div class="card mb-4" v-if="chartData">
        <h3 class="section-title">{{ t('stock.priceChart') }}</h3>
        <PriceChart :chart-data="chartData" />
      </div>

      <div class="detail-grid">
        <!-- Technical Indicators -->
        <div class="card">
          <h3 class="section-title">{{ t('stock.technicalIndicators') }}</h3>
          <div v-if="indicators" class="indicators-grid">
            <div class="indicator-item">
              <span class="indicator-label">SMA (20)</span>
              <span class="indicator-value">{{ formatPrice(indicators.sma20) }}</span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">SMA (50)</span>
              <span class="indicator-value">{{ formatPrice(indicators.sma50) }}</span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">SMA (200)</span>
              <span class="indicator-value">{{ formatPrice(indicators.sma200) }}</span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">RSI (14)</span>
              <span :class="['indicator-value', indicators.rsi > 70 ? 'price-up' : indicators.rsi < 30 ? 'price-down' : '']">
                {{ indicators.rsi?.toFixed(1) }}
              </span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">MACD</span>
              <span :class="['indicator-value', indicators.macd > 0 ? 'price-up' : 'price-down']">
                {{ indicators.macd?.toFixed(2) }}
              </span>
            </div>
            <div class="indicator-item">
              <span class="indicator-label">Signal</span>
              <span class="indicator-value">{{ indicators.macdSignal?.toFixed(2) }}</span>
            </div>
          </div>
          <p v-else class="text-secondary" style="font-size: 14px;">{{ t('stock.noIndicatorData') }}</p>
        </div>

        <!-- AI Prediction -->
        <div class="card prediction-card">
          <h3 class="section-title">{{ t('stock.aiPrediction') }}</h3>
          <div v-if="prediction" class="prediction-content">
            <div :class="['signal-badge', signalClass]">
              <span class="signal-icon" v-if="prediction.signal === '상승'">&#9650;</span>
              <span class="signal-icon" v-else-if="prediction.signal === '하락'">&#9660;</span>
              <span class="signal-icon" v-else>&#9654;</span>
              {{ prediction.signal }}
            </div>
            <div class="confidence-section">
              <span class="confidence-label">{{ t('stock.confidence') }}</span>
              <div class="confidence-bar">
                <div class="confidence-fill" :style="{ width: (prediction.confidence || 0) + '%' }"></div>
              </div>
              <span class="confidence-value">{{ prediction.confidence?.toFixed(1) }}%</span>
            </div>
            <p v-if="prediction.reason" class="prediction-reason">{{ prediction.reason }}</p>
            <button class="btn btn-primary save-btn" @click="savePrediction" :disabled="savingPrediction">
              <span v-if="savingPrediction" class="spinner" style="width:14px;height:14px;border-width:2px;"></span>
              {{ savingPrediction ? t('stock.saving') : t('stock.savePrediction') }}
            </button>
          </div>
          <p v-else class="text-secondary" style="font-size: 14px;">{{ t('stock.noPrediction') }}</p>
        </div>
      </div>
    </template>

    <div v-else class="empty-state">
      <h3>{{ t('stock.notFound') }}</h3>
      <p>{{ t('stock.notFoundDesc', { symbol: symbol }) }}</p>
    </div>
  </div>
</template>

<style scoped>
.back-btn {
  margin-bottom: 20px;
}

.stock-header {
  margin-bottom: 24px;
}

.stock-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.stock-title h1 {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.symbol-badge {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
}

.stock-price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.big-price {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1px;
}

.change-text {
  font-size: 16px;
  font-weight: 600;
}

.last-updated-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.indicators-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.indicator-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.indicator-value {
  font-size: 14px;
  font-weight: 700;
}

.prediction-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.signal-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 24px;
  font-weight: 800;
  width: fit-content;
}

.signal-icon {
  font-size: 18px;
}

.signal-up {
  background: rgba(239, 68, 68, 0.12);
  color: var(--price-up);
}

.signal-down {
  background: rgba(59, 130, 246, 0.12);
  color: var(--price-down);
}

.signal-neutral {
  background: rgba(156, 163, 175, 0.12);
  color: var(--text-secondary);
}

.confidence-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.confidence-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.confidence-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.confidence-value {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.prediction-reason {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.save-btn {
  width: fit-content;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .big-price {
    font-size: 28px;
  }

  .stock-title h1 {
    font-size: 22px;
  }
}
</style>
