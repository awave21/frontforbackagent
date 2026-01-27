<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Header -->
    <div class="lg:hidden bg-white border-b border-slate-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div
            class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center"
          >
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
      <div
        v-if="isSidebarOpen"
        class="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
        @click="isSidebarOpen = false"
      ></div>

      <!-- Mobile Sidebar -->
      <transition
        enter-active-class="transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
        enter-from-class="-translate-x-full opacity-0 scale-95"
        enter-to-class="translate-x-0 opacity-100 scale-100"
        leave-active-class="transition-all duration-400 ease-in"
        leave-from-class="translate-x-0 opacity-100 scale-100"
        leave-to-class="-translate-x-full opacity-0 scale-95"
      >
        <div v-if="isSidebarOpen" class="lg:hidden fixed inset-0 z-50 w-full">
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
                    Войдите в систему, чтобы получить доступ к управлению агентами
                  </p>
                </div>
              </div>
              <button
                @click="showAuthModal = true"
                class="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Войти
              </button>
            </div>
          </div>

          <!-- Header Section -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8"
          >
            <div class="mb-4 sm:mb-0">
              <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
                Мои агенты
              </h1>
              <p class="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Управляйте вашими AI-агентами и настраивайте их работу
              </p>
            </div>
            <div class="flex items-center gap-3">
              <!-- Search Bar -->
              <div
                class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200"
              >
                <SearchIcon class="h-4 w-4 text-slate-400" />
                <span class="text-sm text-slate-400">Поиск агентов...</span>
              </div>
              <!-- Filter Button -->
              <button
                class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-900 font-medium"
              >
                <SlidersHorizontalIcon class="h-4 w-4" />
                <span class="hidden sm:inline">Фильтры</span>
              </button>
              
              <!-- Create New Agent Button (Header) -->
              <NuxtLink
                v-if="isAuthenticated"
                to="/agents/new"
                class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-colors shadow-sm shadow-indigo-100"
              >
                <PlusIcon class="h-4 w-4" />
                <span class="hidden sm:inline">Новый агент</span>
                <span class="sm:hidden">Новый</span>
              </NuxtLink>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <!-- Active Agents -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-slate-600">Активные</p>
              </div>
              <p class="text-3xl font-bold text-green-600">
                {{ activeAgentsCount }}
              </p>
            </div>

            <!-- Total Agents -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-slate-600">Всего агентов</p>
              </div>
              <p class="text-3xl font-bold text-slate-900">
                {{ totalAgentsCount }}
              </p>
            </div>

            <!-- Draft Agents -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-slate-600">
                  Черновики
                </p>
              </div>
              <p class="text-3xl font-bold text-indigo-600">
                {{ draftAgentsCount }}
              </p>
            </div>
          </div>

          <!-- Agents List Section -->
          <div v-if="agentsLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="agents.length === 0" class="text-center py-12">
            <Bot class="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-slate-900 mb-2">Нет агентов</h3>
            <p class="text-slate-600 mb-4">Создайте своего первого AI-агента</p>
            <NuxtLink
              v-if="isAuthenticated"
              to="/agents/new"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Создать агента
            </NuxtLink>
          </div>

          <div v-else class="space-y-4">
            <AgentDetailCard
              v-for="agent in agents"
              :key="agent.id"
              :agent-id="agent.id"
              :title="agent.name"
              :icon="getAgentIcon(agent)"
              :avatar-color="getAgentColor(agent)"
              :border-color="getAgentBorderColor(agent)"
              :type="getAgentType(agent)"
              :stats-bg-color="getAgentStatsBgColor(agent)"
              :stats-text-color="getAgentStatsTextColor(agent)"
              :stats="getAgentStats(agent)"
            />
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
// @ts-ignore - definePageMeta is auto-imported in Nuxt 3
definePageMeta({
  middleware: 'auth'
})

import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  PlusIcon,
  MenuIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  Settings,
  MoreVerticalIcon,
  UserCheck,
  Activity,
  FileCheck,
  AlertCircle,
  Bot,
  X,
  Loader2,
} from "lucide-vue-next";
import { useAgents, type Agent } from "../../composables/useAgents";
import { useAuth } from "../../composables/useAuth";

// Mobile sidebar state
const isSidebarOpen = ref(false);

// Router
const router = useRouter();

// Auth state
const { isAuthenticated } = useAuth();

// Get agents data
const { agents, fetchAgents, isLoading: agentsLoading, error: agentsError } = useAgents();

// Computed stats from real data
const totalAgentsCount = computed(() => agents.value.length);
const activeAgentsCount = computed(() => 
  agents.value.filter(agent => agent.status === 'published').length
);
const draftAgentsCount = computed(() => 
  agents.value.filter(agent => agent.status === 'draft').length
);

// UI state
const showAuthModal = ref(false);

// Load agents on mount
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await fetchAgents();
    } catch (error) {
      console.error('Failed to load agents:', error);
    }
  }
});

// Watch for authentication changes
watch(isAuthenticated, async (newAuth) => {
  if (newAuth) {
    await fetchAgents();
  }
});


// Handle authentication
const handleAuthenticated = () => {
  showAuthModal.value = false;
};

// Helper functions for agent display
const getAgentIcon = (agent: Agent) => {
  // Simple mapping based on agent name
  if (agent.name.toLowerCase().includes('запис')) return 'UserCheck'
  if (agent.name.toLowerCase().includes('диагностик')) return 'Activity'
  if (agent.name.toLowerCase().includes('документац')) return 'FileCheck'
  return 'Bot'
}

const getAgentColor = (agent: Agent) => {
  const colors = [
    'from-sky-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-cyan-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500'
  ]
  // Use agent ID or name hash for consistent colors
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentBorderColor = (agent: Agent) => {
  const colors = [
    'border-sky-100',
    'border-purple-100',
    'border-emerald-100',
    'border-orange-100',
    'border-indigo-100'
  ]
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentType = (agent: Agent) => {
  // Extract meaningful type from system prompt
  if (agent.system_prompt.toLowerCase().includes('пациент')) return 'Управление пациентами'
  if (agent.system_prompt.toLowerCase().includes('диагностик') || agent.system_prompt.toLowerCase().includes('анализ')) return 'Медицинский анализ'
  if (agent.system_prompt.toLowerCase().includes('документ')) return 'Документооборот'
  return 'Общий помощник'
}

const getAgentStatsBgColor = (agent: Agent) => {
  const colors = ['bg-sky-50', 'bg-purple-50', 'bg-emerald-50', 'bg-orange-50', 'bg-indigo-50']
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentStatsTextColor = (agent: Agent) => {
  const colors = ['text-sky-600', 'text-purple-600', 'text-emerald-600', 'text-orange-600', 'text-indigo-600']
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}

const getAgentStats = (agent: Agent) => {
  // Real data from agent
  const statusLabel = agent.status === 'published' ? 'Опубликован' : 'Черновик';
  const modelName = agent.model?.split(':')[1] || agent.model || 'Не указана';
  
  return [
    { value: statusLabel, label: 'Статус' },
    { value: modelName, label: 'Модель' },
    { value: agent.version?.toString() || '1', label: 'Версия' },
    { value: new Date(agent.updated_at).toLocaleDateString('ru-RU'), label: 'Обновлен' }
  ]
}
</script>
