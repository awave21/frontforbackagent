<template>
  <div class="w-full px-5 py-5 flex flex-col gap-5">

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p class="text-muted-foreground">Загрузка данных...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashboardData" class="flex flex-col gap-5">
      <!-- KPI Metrics Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              <MetricCard
                v-for="metric in dashboardData.kpiMetrics"
                :key="metric.id"
                :title="metric.title"
                :value="metric.value"
                :description="metric.description"
                :trend="metric.trend"
                :type="metric.type"
                :icon="metric.icon"
              />
      </div>

      <!-- Conversion Metrics Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              <MetricCard
                v-for="metric in dashboardData.conversionMetrics"
                :key="metric.id"
                :title="metric.title"
                :value="metric.value"
                :description="metric.description"
                :trend="''"
                :type="metric.type"
                :icon="metric.icon"
              />
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <ChartCard
          title="Динамика записей"
          subtitle="Созданные и отмененные записи"
          chart-type="bar"
          :chart-data="entryDynamicsData"
        />
        <ChartCard
          title="Распределение сообщений"
          subtitle="Доля типов сообщений"
          chart-type="doughnut"
          :chart-data="messageDistributionData"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - definePageMeta is auto-imported in Nuxt 3
// Page meta
definePageMeta({
  middleware: 'auth'
})

import { computed, onMounted } from 'vue'
import { CalendarIcon, ChevronDownIcon } from 'lucide-vue-next'
import { useDashboardData } from '../composables/useDashboardData'

// Layout state
const { pageTitle } = useLayoutState()

// Auth state
const { isAuthenticated } = useAuth()

// Set page title
onMounted(() => {
  pageTitle.value = 'Аналитика'
})

// Dashboard data - lazy load for faster page rendering
const { data: dashboardData, pending, error } = await useDashboardData()

// Chart data computed properties
const entryDynamicsData = computed(() => {
  if (!dashboardData.value?.charts?.entryDynamics) {
    return {
      labels: [],
      datasets: []
    }
  }
  return dashboardData.value.charts.entryDynamics
})

const messageDistributionData = computed(() => {
  if (!dashboardData.value?.charts?.messageDistribution) {
    return {
      labels: [],
      datasets: []
    }
  }
  return dashboardData.value.charts.messageDistribution
})
</script>
