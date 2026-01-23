<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click="$emit('close')"
      >
        <Transition
          enter-active-class="transition-all duration-300"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition-all duration-300"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isOpen"
            class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-slate-900">
                  Создать нового агента
                </h2>
                <button
                  @click="$emit('close')"
                  class="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X class="h-5 w-5" />
                </button>
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- Название агента -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Название агента *
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Например: Агент поддержки клиентов"
                  />
                </div>

                <!-- Системный промпт -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Системный промпт *
                  </label>
                  <textarea
                    v-model="form.system_prompt"
                    required
                    rows="4"
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Опишите роль и поведение агента..."
                  />
                </div>

                <!-- Модель -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-2">
                    Модель ИИ *
                  </label>
                  <select
                    v-model="form.model"
                    required
                    class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Выберите модель</option>
                    <option value="openai:gpt-4o-mini">GPT-4o Mini</option>
                    <option value="openai:gpt-4o">GPT-4o</option>
                    <option value="openai:gpt-4">GPT-4</option>
                    <option value="anthropic:claude-3-haiku">Claude 3 Haiku</option>
                    <option value="anthropic:claude-3-sonnet">Claude 3 Sonnet</option>
                  </select>
                </div>

                <!-- Параметры LLM -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Температура
                    </label>
                    <input
                      v-model.number="form.llm_params.temperature"
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="0.7"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      Макс. токенов
                    </label>
                    <input
                      v-model.number="form.llm_params.max_tokens"
                      type="number"
                      min="1"
                      max="4000"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <!-- Ошибка -->
                <div v-if="error" class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {{ error }}
                </div>

                <!-- Кнопки -->
                <div class="flex gap-3 pt-4">
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="flex-1 px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin" />
                    {{ isLoading ? 'Создание...' : 'Создать агента' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { useAgents } from '../composables/useAgents'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  agentCreated: [agent: any]
}>()

const { createAgent, isLoading, error } = useAgents()

// Форма создания агента
const form = reactive({
  name: '',
  system_prompt: '',
  model: '',
  llm_params: {
    temperature: 0.7,
    max_tokens: 1000
  }
})

// Обработчик отправки формы
const handleSubmit = async () => {
  try {
    const newAgent = await createAgent({
      ...form,
      status: 'draft' as const,
      version: 1
    })

    emit('agentCreated', newAgent)

    // Сброс формы
    form.name = ''
    form.system_prompt = ''
    form.model = ''
    form.llm_params.temperature = 0.7
    form.llm_params.max_tokens = 1000

    emit('close')

    // Перенаправление на страницу редактирования
    await navigateTo(`/agents/${newAgent.id}`)
  } catch (err) {
    console.error('Ошибка создания агента:', err)
  }
}

// Сброс формы при закрытии
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    form.name = ''
    form.system_prompt = ''
    form.model = ''
    form.llm_params.temperature = 0.7
    form.llm_params.max_tokens = 1000
  }
})
</script>