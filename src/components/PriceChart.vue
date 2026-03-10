<script setup>
import { computed, inject } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  mini: {
    type: Boolean,
    default: false
  }
})

const isDark = inject('isDark')

const mergedOptions = computed(() => {
  const gridColor = isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const textColor = isDark.value ? '#9ca3af' : '#6b7280'

  const base = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark.value ? '#1a1d28' : '#fff',
        titleColor: isDark.value ? '#e4e6ed' : '#111827',
        bodyColor: isDark.value ? '#9ca3af' : '#4b5563',
        borderColor: isDark.value ? '#2d3148' : '#e5e7eb',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, maxTicksLimit: 8, font: { size: 11 } },
        border: { display: false }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false }
      }
    }
  }

  if (props.mini) {
    base.plugins.tooltip = { enabled: false }
    base.scales = {
      x: { display: false },
      y: { display: false }
    }
    base.elements = {
      point: { radius: 0 },
      line: { borderWidth: 1.5 }
    }
  }

  return { ...base, ...props.options }
})
</script>

<template>
  <div :class="['chart-wrapper', { mini }]">
    <Line :data="chartData" :options="mergedOptions" />
  </div>
</template>

<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}

.chart-wrapper.mini {
  height: 50px;
}
</style>
