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
        <div v-if="isSidebarOpen" class="lg:hidden fixed inset-0 z-50 w-full">
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
                    Войдите в систему для создания агента
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

          <!-- Header -->
          <div class="flex items-center justify-between mb-8">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">Создать нового агента</h1>
              <p class="text-slate-500 mt-1">Настройте базовые параметры вашего будущего AI-помощника</p>
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="handleCancel"
                class="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-900 transition-colors"
              >
                Отменить
              </button>
              <button
                @click="handleCreate"
                :disabled="creating || !isValid"
                class="px-8 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200"
              >
                <Loader2 v-if="creating" class="h-4 w-4 animate-spin" />
                <Plus v-else class="h-4 w-4" />
                Создать
              </button>
            </div>
          </div>

          <!-- Tabs Navigation (Styled like the edit page) -->
          <div class="flex items-center gap-1 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
            <button
              class="px-5 py-3 text-sm font-medium transition-all relative whitespace-nowrap text-indigo-600 bg-indigo-50 rounded-t-lg"
            >
              Основная настройка
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
            </button>
            <button
              disabled
              class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap"
            >
              Подключения
            </button>
            <button
              disabled
              class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap"
            >
              База знаний
            </button>
            <button
              disabled
              class="px-5 py-3 text-sm font-medium text-slate-300 cursor-not-allowed whitespace-nowrap"
            >
              Модель
            </button>
          </div>

          <!-- Content Card -->
          <div class="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <form @submit.prevent="handleCreate" class="space-y-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-2">Название агента *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    placeholder="Например: Агент поддержки"
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label class="block text-sm font-bold text-slate-900 mb-2">Модель ИИ *</label>
                  <select
                    v-model="form.model"
                    required
                    class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  >
                    <option value="">Выберите модель</option>
                    <option value="openai:gpt-4o-mini">GPT-4o Mini</option>
                    <option value="openai:gpt-4o">GPT-4o</option>
                    <option value="anthropic:claude-3-haiku">Claude 3 Haiku</option>
                  </select>
                </div>
              </div>

              <div>
                <div class="mb-4">
                  <h3 class="text-sm font-bold text-slate-900">Системный промпт *</h3>
                  <p class="text-xs text-slate-500 mt-1">Опишите роль и поведение агента</p>
                </div>
                <textarea
                  v-model="form.system_prompt"
                  required
                  rows="10"
                  class="w-full px-5 py-4 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-all resize-none leading-relaxed"
                  placeholder="Вы — помощник для..."
                ></textarea>
              </div>

              <div class="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  class="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors"
                >
                  <Sparkles class="h-4 w-4" />
                  Помочь с промптом
                </button>
                <p class="text-xs text-slate-400">* Обязательные поля для заполнения</p>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MenuIcon,
  AlertCircle,
  Loader2,
  Plus,
  Sparkles,
  Cpu,
  Settings
} from 'lucide-vue-next'
import { useAgents } from '../../composables/useAgents'
import { useAuth } from '../../composables/useAuth'

// Auth and Router
const { isAuthenticated } = useAuth()
const router = useRouter()
const { createAgent } = useAgents()

// State
const isSidebarOpen = ref(false)
const showAuthModal = ref(false)
const creating = ref(false)

const form = ref({
  name: '',
  model: 'openai:gpt-4o-mini',
  system_prompt: ''
})

const isValid = computed(() => {
  return form.value.name.trim() !== '' && 
         form.value.model !== '' && 
         form.value.system_prompt.trim() !== ''
})

const handleCreate = async () => {
  if (!isValid.value) return
  
  try {
    creating.value = true
    const newAgent = await createAgent({
      ...form.value,
      status: 'draft',
      version: 1,
      llm_params: {
        temperature: 0.7,
        max_tokens: 1000
      }
    })
    
    // Redirect to the newly created agent's edit page
    router.push(`/agents/${newAgent.id}`)
  } catch (error) {
    console.error('Error creating agent:', error)
  } finally {
    creating.value = false
  }
}

const handleCancel = () => {
  router.push('/agents')
}

const handleAuthenticated = () => {
  showAuthModal.value = false
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
