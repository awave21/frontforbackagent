<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-slate-900 mb-1">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="text-xs sm:text-sm text-slate-500">
        {{ subtitle }}
      </p>
    </div>

    <div class="h-64 sm:h-80">
      <Bar
        v-if="chartType === 'bar'"
        :data="chartData"
        :options="chartOptions"
      />
      <Doughnut
        v-else-if="chartType === 'doughnut'"
        :data="chartData"
        :options="doughnutOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface Props {
  title: string
  subtitle?: string
  chartType: 'bar' | 'doughnut'
  chartData: any
}

const props = defineProps<Props>()

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 12
      }
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
        font: {
          size: 11
        }
      },
      beginAtZero: true
    }
  }
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        padding: 15,
        usePointStyle: true,
        font: {
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: {
        size: 14
      },
      bodyFont: {
        size: 12
      },
      callbacks: {
        label: function(context: any) {
          return `${context.label}: ${context.parsed}%`
        }
      }
    }
  },
  cutout: '60%'
}
</script>
