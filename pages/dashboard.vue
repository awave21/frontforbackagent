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
          <!-- Auth Status Banner -->
          <div v-if="!isAuthenticated" class="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <AlertCircle class="h-5 w-5 text-yellow-400 mr-3" />
                <div>
                  <h3 class="text-sm font-medium text-yellow-800">
                    Требуется аутентификация
                  </h3>
                  <p class="text-sm text-yellow-700 mt-1">
                    Зарегистрируйтесь или войдите в систему
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="showAuthModal = true"
                  class="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Войти
                </button>
              </div>
            </div>
          </div>

          <!-- Header Section -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8">
            <div class="mb-4 sm:mb-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
                Панель управления
              </h1>
              <p class="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Добро пожаловать обратно, Др. Иванов
              </p>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white rounded-lg border border-slate-200 self-start sm:self-auto">
              <CalendarIcon class="h-4 w-4 text-slate-600" />
              <span class="text-xs sm:text-sm font-medium text-slate-900 hidden sm:inline">Последние 7 дней</span>
              <span class="text-xs sm:text-sm font-medium text-slate-900 sm:hidden">7 дней</span>
              <ChevronDownIcon class="h-4 w-4 text-slate-600" />
            </div>
          </div>

          <!-- Metrics Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-8">
            <MetricCard
              title="Всего запросов"
              value="2,847"
              change="+12% от прошлой недели"
              changeType="positive"
              icon="TrendingUp"
            />
            <MetricCard
              title="Активных агентов"
              value="3"
              change="Все агенты онлайн"
              changeType="neutral"
              icon="Bot"
            />
            <MetricCard
              title="Время отклика"
              value="0.8s"
              change="Среднее время"
              changeType="neutral"
              icon="Zap"
            />
          </div>

          <!-- Agents Section -->
          <div class="mb-6 lg:mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-3 sm:gap-0">
              <h2 class="text-lg sm:text-xl font-bold text-slate-900">
                Подключенные агенты
              </h2>
              <button class="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-colors text-sm sm:text-base">
                <PlusIcon class="h-4 w-4" />
                <span class="hidden sm:inline">Добавить агента</span>
                <span class="sm:hidden">Добавить</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
              <AgentCard
                v-for="agent in agents"
                :key="agent.id"
                :agent="agent"
              />
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h2 class="text-lg sm:text-xl font-bold text-slate-900 mb-4 lg:mb-6">
              Недавняя активность
            </h2>
            <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div class="divide-y divide-slate-100">
                <ActivityItem
                  v-for="activity in recentActivities"
                  :key="activity.id"
                  :activity="activity"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Auth Modal -->
    <AuthModal
      :is-open="showAuthModal"
      @close="showAuthModal = false"
      @authenticated="handleAuthenticated"
    />
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  middleware: 'auth'
})

import { ref } from 'vue'
import { CalendarIcon, ChevronDownIcon, PlusIcon, MenuIcon, AlertCircle } from 'lucide-vue-next'
import { useDashboardData } from '../composables/useDashboardData'
import { useAuth } from '../composables/useAuth'

// Mobile sidebar state
const isSidebarOpen = ref(false)

// Auth state
const { isAuthenticated, user, tenant } = useAuth()
const showAuthModal = ref(false)

// Auth handler
const handleAuthenticated = () => {
  showAuthModal.value = false
  // Можно обновить данные после аутентификации
}


// Composables
const { data: dashboardData } = await useDashboardData()

// Agents data
const agents = [
  {
    id: 1,
    name: 'Агент Записи',
    icon: 'UserCheck',
    color: 'from-sky-500 to-cyan-500',
    borderColor: 'border-sky-100',
    stats: [
      { value: '1,284', label: 'Запросов' },
      { value: '98%', label: 'Успешно' }
    ],
    status: 'Активен',
    statusColor: 'text-green-600'
  },
  {
    id: 2,
    name: 'Агент Диагностики',
    icon: 'Activity',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-100',
    stats: [
      { value: '892', label: 'Запросов' },
      { value: '95%', label: 'Успешно' }
    ],
    status: 'Активен',
    statusColor: 'text-green-600'
  },
  {
    id: 3,
    name: 'Агент Документации',
    icon: 'FileCheck',
    color: 'from-emerald-500 to-cyan-500',
    borderColor: 'border-emerald-100',
    stats: [
      { value: '671', label: 'Запросов' },
      { value: '100%', label: 'Успешно' }
    ],
    status: 'Активен',
    statusColor: 'text-green-600'
  }
]

// Recent activities data
const recentActivities = [
  {
    id: 1,
    title: 'Агент Записи обработал запрос',
    time: '2 минуты назад',
    icon: 'UserCheck',
    color: 'from-sky-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Агент Диагностики завершил анализ',
    time: '15 минут назад',
    icon: 'Activity',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Агент Документации создал отчет',
    time: '1 час назад',
    icon: 'FileCheck',
    color: 'from-emerald-500 to-cyan-500'
  }
]
</script>