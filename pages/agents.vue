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
              <!-- Add New Agent Button -->
              <button
                v-if="isAuthenticated && !showCreateForm"
                @click="showCreateForm = true"
                class="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-colors"
              >
                <PlusIcon class="h-4 w-4" />
                <span class="hidden sm:inline">Новый агент</span>
                <span class="sm:hidden">Новый</span>
              </button>
            </div>
          </div>

          <!-- Create Agent Form -->
          <div v-if="showCreateForm" class="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-slate-900">Создать нового агента</h2>
              <button
                @click="showCreateForm = false"
                class="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="handleCreateAgent" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Название агента *
                  </label>
                  <input
                    v-model="createForm.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Например: Агент поддержки клиентов"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Модель ИИ *
                  </label>
                  <select
                    v-model="createForm.model"
                    required
                    class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Выберите модель</option>
                    <option value="openai:gpt-4o-mini">GPT-4o Mini</option>
                    <option value="openai:gpt-4o">GPT-4o</option>
                    <option value="openai:gpt-4">GPT-4</option>
                    <option value="anthropic:claude-3-haiku">Claude 3 Haiku</option>
                    <option value="anthropic:claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Системный промпт *
                </label>
                <textarea
                  v-model="createForm.system_prompt"
                  required
                  rows="4"
                  class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Опишите роль и поведение агента..."
                />
              </div>

              <div class="flex gap-3">
                <button
                  type="button"
                  @click="showCreateForm = false"
                  class="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  :disabled="creatingAgent"
                  class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  <Loader2 v-if="creatingAgent" class="h-4 w-4 animate-spin" />
                  {{ creatingAgent ? 'Создание...' : 'Создать агента' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Add Agent Button -->
          <div v-if="!showCreateForm && isAuthenticated" class="mb-8">
            <button
              @click="showCreateForm = true"
              class="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-colors"
            >
              <PlusIcon class="h-5 w-5" />
              Создать нового агента
            </button>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <!-- Active Agents -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-slate-600">Активные</p>
              </div>
              <p class="text-3xl font-bold text-green-600">3</p>
            </div>

            <!-- Total Agents -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-slate-600">Всего агентов</p>
              </div>
              <p class="text-3xl font-bold text-slate-900">3</p>
            </div>

            <!-- Today's Requests -->
            <div class="bg-white rounded-xl border border-slate-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-normal text-slate-600">
                  Запросов сегодня
                </p>
              </div>
              <p class="text-3xl font-bold text-indigo-600">847</p>
            </div>
          </div>

          <!-- Agents List Section -->
          <div v-if="agentsLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <div v-else-if="agentsError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-800">Ошибка загрузки агентов: {{ agentsError }}</p>
          </div>

          <div v-else-if="agents.length === 0" class="text-center py-12">
            <Bot class="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-slate-900 mb-2">Нет агентов</h3>
            <p class="text-slate-600 mb-4">Создайте своего первого AI-агента</p>
            <button
              v-if="isAuthenticated"
                @click="showCreateForm = true"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Создать агента
            </button>
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

import { ref, onMounted, watch } from "vue";
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
import { useAgents, type Agent } from "../composables/useAgents";
import { useAuth } from "../composables/useAuth";

// Mobile sidebar state
const isSidebarOpen = ref(false);

// Router
const router = useRouter();

// Auth state
const { isAuthenticated } = useAuth();

// Create agent form
const createForm = ref({
  name: '',
  system_prompt: '',
  model: '',
});

// Get agents data
const { agents, fetchAgents, createAgent, isLoading: agentsLoading, error: agentsError } = useAgents();

// UI state
const showCreateForm = ref(false);
const showAuthModal = ref(false);
const creatingAgent = ref(false);

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


// Handle agent creation
const handleCreateAgent = async () => {
  try {
    creatingAgent.value = true;
    const newAgent = await createAgent({
      ...createForm.value,
      status: 'draft',
      version: 1,
      llm_params: {
        temperature: 0.7,
        max_tokens: 1000
      }
    });

    // Reset form
    createForm.value = {
      name: '',
      system_prompt: '',
      model: '',
    };
    showCreateForm.value = false;

    // Navigate to edit page
    await router.push(`/agents/${newAgent.id}`);
  } catch (error) {
    console.error('Error creating agent:', error);
  } finally {
    creatingAgent.value = false;
  }
};

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
  // Mock stats - in real app these would come from API or analytics
  return [
    { value: Math.floor(Math.random() * 2000 + 500).toLocaleString(), label: 'Обработано запросов' },
    { value: `${Math.floor(Math.random() * 10 + 90)}%`, label: 'Успешных ответов' },
    { value: `${(Math.random() * 2 + 0.5).toFixed(1)}s`, label: 'Среднее время' },
    { value: '24/7', label: 'Доступность' }
  ]
}
</script>
