<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  stock: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['remove'])
const router = useRouter()
const { t } = useI18n()

const changeClass = computed(() => {
  if (!props.stock.change) return 'price-neutral'
  return props.stock.change > 0 ? 'price-up' : 'price-down'
})

const changeSign = computed(() => {
  if (!props.stock.change) return ''
  return props.stock.change > 0 ? '+' : ''
})

const updatedAtFormatted = computed(() => {
  const ua = props.stock.updated_at
  if (!ua) return ''
  const d = new Date(ua)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
})

function formatPrice(price) {
  if (price == null) return '-'
  return Number(price).toLocaleString('ko-KR')
}

function handleClick() {
  router.push(`/stock/${props.stock.symbol}`)
}

function handleRemove(e) {
  e.stopPropagation()
  emit('remove', props.stock.symbol)
}
</script>

<template>
  <div class="card card-hover stock-card" @click="handleClick">
    <div class="card-header">
      <div class="stock-info">
        <span class="stock-symbol">{{ stock.symbol }}</span>
        <span class="stock-name">{{ stock.name || stock.symbol }}</span>
      </div>
      <button class="btn-icon remove-btn" @click="handleRemove" :title="t('stock.removeFromWatchlist')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="card-price">
      <span class="current-price">{{ formatPrice(stock.price) }}</span>
      <span :class="['change-info', changeClass]">
        {{ changeSign }}{{ formatPrice(stock.change) }}
        <span v-if="stock.changePercent" class="change-pct">
          ({{ changeSign }}{{ stock.changePercent?.toFixed(2) }}%)
        </span>
      </span>
    </div>

    <div class="card-updated" v-if="updatedAtFormatted">
      <span class="updated-text">{{ t('updatedAt') }} {{ updatedAtFormatted }}</span>
    </div>
  </div>
</template>

<style scoped>
.stock-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.stock-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stock-symbol {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.stock-name {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}

.remove-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.stock-card:hover .remove-btn {
  opacity: 1;
}

.card-price {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.current-price {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.change-info {
  font-size: 14px;
  font-weight: 600;
}

.change-pct {
  font-weight: 500;
}

.card-updated {
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.updated-text {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
