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
        <div
          v-if="isSidebarOpen"
          class="lg:hidden fixed inset-0 z-50 w-full"
        >
          <DashboardSidebar @close="isSidebarOpen = false" />
        </div>
      </transition>

      <!-- Main Content -->
      <main class="flex-1 bg-slate-50 p-4 sm:p-6 lg:p-10">
        <div class="max-w-4xl mx-auto">
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
                    Войдите в систему для редактирования агента
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

          <!-- Loading State -->
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-800">{{ error }}</p>
          </div>

          <!-- Agent Edit Form -->
          <div v-else-if="agent" class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
              <div>
                <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">
                  Редактирование агента
                </h1>
                <p class="text-slate-600 mt-1">
                  {{ agent.name }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <NuxtLink
                  to="/agents"
                  class="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Отмена
                </NuxtLink>
                <button
                  @click="handleSave"
                  :disabled="saving"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
                  Сохранить изменения
                </button>
              </div>
            </div>

            <!-- Agent Avatar Preview -->
            <div class="bg-white rounded-xl border border-slate-200 p-6">
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br"
                  :class="getAgentColor(agent)"
                >
                  <component :is="getAgentIcon(agent)" class="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-slate-900">{{ agent.name }}</h3>
                  <p class="text-sm text-slate-600">Статус: {{ agent.status }}</p>
                </div>
              </div>
            </div>

            <!-- Edit Form -->
            <form @submit.prevent="handleSave" class="space-y-6">
              <!-- Basic Information -->
              <div class="bg-white rounded-xl border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Основная информация</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Name -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Название агента *
                    </label>
                    <input
                      v-model="form.name"
                      type="text"
                      required
                      class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <!-- Model -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Модель ИИ *
                    </label>
                    <select
                      v-model="form.model"
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

                <!-- System Prompt -->
                <div class="mt-6">
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Системный промпт *
                  </label>
                    <textarea
                      v-model="form.system_prompt"
                      required
                      rows="6"
                      class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      placeholder="Опишите роль и поведение агента..."
                    />
                </div>
              </div>

              <!-- LLM Parameters -->
              <div class="bg-white rounded-xl border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Параметры модели</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Температура (0-2)
                    </label>
                    <input
                      v-model.number="form.llm_params.temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p class="text-xs text-slate-500 mt-1">
                      Чем ниже значение, тем более детерминированный ответ
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Максимальное количество токенов
                    </label>
                    <input
                      v-model.number="form.llm_params.max_tokens"
                      type="number"
                      min="1"
                      max="4000"
                      class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p class="text-xs text-slate-500 mt-1">
                      Максимальная длина ответа
                    </p>
                  </div>
                </div>
              </div>

              <!-- Agent Status -->
              <div class="bg-white rounded-xl border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-slate-900 mb-4">Статус агента</h3>

                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Статус
                  </label>
                  <select
                    v-model="form.status"
                    class="w-full px-3 py-2 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликован</option>
                  </select>
                </div>
              </div>

              <!-- Save Button (bottom) -->
              <div class="flex justify-end gap-3 pt-6 border-t border-slate-200">
                <NuxtLink
                  to="/agents"
                  class="px-6 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Отмена
                </NuxtLink>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
                  Сохранить изменения
                </button>
              </div>
            </form>
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

import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// @ts-ignore - Nuxt 3 auto-imports
import { navigateTo } from '#app'
import {
  MenuIcon,
  AlertCircle,
  Loader2,
  UserCheck,
  Activity,
  FileCheck,
  Bot
} from 'lucide-vue-next'
// @ts-ignore - Nuxt 3 auto-imports
import { useAgents, type Agent, type AgentStatus } from '~/composables/useAgents'
// @ts-ignore - Nuxt 3 auto-imports
import { useAuth } from '~/composables/useAuth'

// Route and composables
const route = useRoute()
const { getAgent, updateAgent, isLoading: apiLoading, error: apiError } = useAgents()
const { isAuthenticated } = useAuth()

// State
const isSidebarOpen = ref(false)
const showAuthModal = ref(false)
const agent = ref<Agent | null>(null)
const loading = ref(true)
const saving = ref(false)
const error = ref<string | null>(null)

// Form data
const form = ref({
  name: '',
  system_prompt: '',
  model: '',
  status: 'draft' as AgentStatus,
  llm_params: {
    temperature: 0.7,
    max_tokens: 1000
  }
})

// Load agent data
onMounted(async () => {
  const agentId = route.params.id as string

  if (!agentId) {
    error.value = 'ID агента не указан'
    loading.value = false
    return
  }

  try {
    const agentData = await getAgent(agentId)
    agent.value = agentData

    // Populate form
    form.value = {
      name: agentData.name,
      system_prompt: agentData.system_prompt,
      model: agentData.model,
      status: agentData.status,
      llm_params: agentData.llm_params || {
        temperature: 0.7,
        max_tokens: 1000
      }
    }
  } catch (err: any) {
    error.value = err.message || 'Ошибка загрузки агента'
  } finally {
    loading.value = false
  }
})

// Handle save
const handleSave = async () => {
  if (!agent.value) return

  try {
    saving.value = true
    await updateAgent(agent.value.id, form.value)

    // Show success message and redirect
    alert('Агент успешно обновлен!')
    navigateTo('/agents')
  } catch (err: any) {
    error.value = err.message || 'Ошибка сохранения агента'
  } finally {
    saving.value = false
  }
}

// Handle authentication
const handleAuthenticated = () => {
  showAuthModal.value = false
  // Reload agent data
  window.location.reload()
}

// Helper functions
const getAgentIcon = (agent: Agent) => {
  if (agent.name.toLowerCase().includes('запис')) return UserCheck
  if (agent.name.toLowerCase().includes('диагностик')) return Activity
  if (agent.name.toLowerCase().includes('документац')) return FileCheck
  return Bot
}

const getAgentColor = (agent: Agent) => {
  const colors = [
    'from-sky-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-cyan-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500'
  ]
  const index = agent.id.charCodeAt(0) % colors.length
  return colors[index]
}
</script>