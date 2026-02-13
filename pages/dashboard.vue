<template>
  <div class="w-full px-5 py-5 flex flex-col gap-5">
    <!-- Auth Status Banner -->
    <div v-if="!isAuthenticated" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
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


    <!-- Metrics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            <MetricCard
              title="Всего агентов"
              :value="String(agents.length)"
              description="Все зарегистрированные агенты"
              :trend="agents.filter(a => a.status === 'published').length + ' активных'"
              type="info"
              icon="BarChart2"
            />
            <MetricCard
              title="Активных агентов"
              :value="String(agents.filter(a => a.status === 'published').length)"
              description="Опубликованные и работающие"
              trend="Все системы в норме"
              type="positive"
              icon="Target"
            />
            <MetricCard
              title="Черновики"
              :value="String(agents.filter(a => a.status === 'draft').length)"
              description="Агенты в разработке"
              trend="Ожидают публикации"
              type="warning"
              icon="FileText"
            />
    </div>

    <!-- Agents Section -->
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 gap-3 sm:gap-0">
        <h2 class="text-lg sm:text-xl font-bold text-foreground">
                Подключенные агенты
        </h2>
        <NuxtLink
          to="/agents/new"
          class="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm sm:text-base"
        >
          <PlusIcon class="h-4 w-4" />
          <span class="hidden sm:inline">Добавить агента</span>
          <span class="sm:hidden">Добавить</span>
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <div v-if="agentsLoading" class="flex justify-center py-8">
        <Loader2 class="h-8 w-8 text-primary animate-spin" />
      </div>

      <!-- Empty State -->
      <div v-else-if="agents.length === 0" class="bg-background rounded-xl border border-border p-12 text-center">
        <Bot class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-medium text-foreground mb-2">Нет агентов</h3>
        <p class="text-muted-foreground text-sm mb-4">Создайте своего первого AI-агента</p>
        <NuxtLink
          to="/agents/new"
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
        >
          <PlusIcon class="h-4 w-4" />
          Создать агента
        </NuxtLink>
      </div>

      <!-- Agents Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <AgentCard
          v-for="agent in agents"
          :key="agent.id"
          :agent="agent"
        />
      </div>
    </div>

    <!-- Recent Activity -->
    <div>
      <h2 class="text-lg sm:text-xl font-bold text-foreground mb-4 lg:mb-6">
        Недавняя активность
      </h2>
      <div class="bg-background rounded-xl border border-border overflow-hidden">
        <div class="divide-y divide-border">
          <ActivityItem
            v-for="activity in recentActivities"
            :key="activity.id"
            :activity="activity"
          />
        </div>
      </div>
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

import { ref, onMounted, watch } from 'vue'
import { CalendarIcon, ChevronDownIcon, PlusIcon, AlertCircle, Bot, Loader2 } from 'lucide-vue-next'
import { useDashboardData } from '../composables/useDashboardData'
import { useAuth } from '../composables/useAuth'
import { useAgents } from '../composables/useAgents'

// Layout state
const { pageTitle } = useLayoutState()

// Auth state
const { isAuthenticated, user } = useAuth()
const showAuthModal = ref(false)

// Auth handler
const handleAuthenticated = () => {
  showAuthModal.value = false
  // Можно обновить данные после аутентификации
}


// Composables
const { data: dashboardData } = await useDashboardData()

// Agents data (real)
const { agents, fetchAgents, isLoading: agentsLoading } = useAgents()

const loadAgents = () => {
  if (isAuthenticated.value) {
    fetchAgents()
  }
}

onMounted(() => {
  pageTitle.value = 'Панель управления'
  loadAgents()
})

watch(isAuthenticated, (val) => {
  if (val) loadAgents()
})

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