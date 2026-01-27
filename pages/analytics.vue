<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xs">М</span>
          </div>
          <span class="text-slate-900 font-bold">МедиАИ</span>
        </div>
        <button
          @click="isSidebarOpen = !isSidebarOpen"
          class="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <MenuIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <div class="flex">
      <!-- Desktop Sidebar -->
      <DashboardSidebar class="hidden lg:block" />

      <!-- Mobile Sidebar Overlay -->
      <transition
        enter-active-class="transition-all duration-400 ease-out"
        enter-from-class="opacity-0 backdrop-blur-0"
        enter-to-class="opacity-100 backdrop-blur-sm"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 backdrop-blur-sm"
        leave-to-class="opacity-0 backdrop-blur-0"
      >
        <div
          v-if="isSidebarOpen"
          class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          @click="isSidebarOpen = false"
        ></div>
      </transition>

      <!-- Mobile Sidebar -->
      <transition
        enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        enter-from-class="-translate-x-full opacity-0 scale-95"
        enter-to-class="translate-x-0 opacity-100 scale-100"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="translate-x-0 opacity-100 scale-100"
        leave-to-class="-translate-x-full opacity-0 scale-95"
      >
        <div
          v-if="isSidebarOpen"
          class="lg:hidden fixed inset-0 z-50 w-full"
        >
          <DashboardSidebar @close="isSidebarOpen = false" />
        </div>
      </transition>

      <!-- Main Content -->
      <main class="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10">
        <div class="max-w-7xl mx-auto">
          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8">
            <div class="mb-4 sm:mb-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
                Аналитика
              </h1>
              <p class="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Статистика и метрики работы агентов
              </p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white rounded-lg border border-slate-200 self-start sm:self-auto">
              <CalendarIcon class="h-4 w-4 text-slate-600" />
              <span class="text-xs sm:text-sm font-medium text-slate-900 hidden sm:inline">Период анализа</span>
              <span class="text-xs sm:text-sm font-medium text-slate-900 sm:hidden">Период</span>
              <ChevronDownIcon class="h-4 w-4 text-slate-600" />
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="pending" class="flex items-center justify-center py-20">
            <div class="text-center">
              <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p class="text-slate-600">Загрузка данных...</p>
            </div>
          </div>

          <!-- Dashboard Content -->
          <div v-else-if="dashboardData">
            <!-- KPI Metrics Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-6 lg:mb-8">
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
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 mb-6">
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
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore - definePageMeta is auto-imported in Nuxt 3
// Page meta
definePageMeta({
  middleware: 'auth'
})

import { ref, computed } from 'vue'
import { CalendarIcon, ChevronDownIcon, MenuIcon } from 'lucide-vue-next'
import { useDashboardData } from '../composables/useDashboardData'
import { useAuth } from '../composables/useAuth'

// Mobile sidebar state
const isSidebarOpen = ref(false)

// Auth state
const { isAuthenticated } = useAuth()

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
