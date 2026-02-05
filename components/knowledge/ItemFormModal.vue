<template>
  <Teleport to="body">
    <Transition name="sheet-slide">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[60]"
        aria-modal="true"
        role="dialog"
      >
        <div 
          class="fixed inset-0 bg-black/40 backdrop-blur-sm" 
          @click="handleClose"
        ></div>
        <div
          class="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-bold text-slate-900">
                {{ editItem ? 'Редактировать запись' : 'Добавить запись' }}
              </h2>
              <p class="text-sm text-slate-500 mt-0.5">{{ directoryName }}</p>
            </div>
            <button 
              aria-label="Закрыть" 
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
              @click="handleClose"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Scrollable Content -->
          <form @submit.prevent="handleSubmit" class="flex-1 flex flex-col min-h-0">
            <div class="flex-1 overflow-y-auto p-6 space-y-5">
              <div v-for="col in columns" :key="col.name">
                <label class="text-sm font-medium text-slate-700 block mb-1.5">
                  {{ col.label }}
                  <span v-if="col.required" class="text-red-500 ml-0.5">*</span>
                </label>
                
                <!-- Text input -->
                <input
                  v-if="col.type === 'text' && !isLongText(col)"
                  v-model="form[col.name]"
                  type="text"
                  :required="col.required"
                  :placeholder="getPlaceholder(col)"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                />
                
                <!-- Textarea for long text -->
                <textarea
                  v-else-if="col.type === 'text' && isLongText(col)"
                  v-model="form[col.name]"
                  :required="col.required"
                  :placeholder="getPlaceholder(col)"
                  rows="4"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all resize-none"
                ></textarea>
                
                <!-- Number input -->
                <input
                  v-else-if="col.type === 'number'"
                  v-model.number="form[col.name]"
                  type="number"
                  :required="col.required"
                  placeholder="0"
                  step="any"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all font-mono"
                />
                
                <!-- Date input -->
                <input
                  v-else-if="col.type === 'date'"
                  v-model="form[col.name]"
                  type="date"
                  :required="col.required"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                />
                
                <!-- Bool input (checkbox) -->
                <label
                  v-else-if="col.type === 'bool'"
                  class="mt-1 flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <input
                    v-model="form[col.name]"
                    type="checkbox"
                    class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span class="text-sm text-slate-600">{{ form[col.name] ? 'Да' : 'Нет' }}</span>
                </label>
              </div>

              <p v-if="error" class="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{{ error }}</p>
            </div>

            <!-- Footer -->
            <div class="flex-shrink-0 bg-white border-t border-slate-100 px-6 py-4 flex items-center gap-3">
              <button
                type="button"
                class="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                @click="handleClose"
              >
                Отмена
              </button>
              <button
                type="submit"
                class="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                :disabled="isSubmitting"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <span>{{ isSubmitting ? 'Сохранение...' : (editItem ? 'Сохранить' : 'Добавить') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'

type Column = {
  name: string
  label: string
  type: string
  required: boolean
}

type DirectoryItem = {
  id: string
  data: Record<string, any>
}

const props = defineProps<{
  isOpen: boolean
  directoryName: string
  columns: Column[]
  editItem?: DirectoryItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Record<string, any>, itemId?: string): void
}>()

const form = ref<Record<string, any>>({})
const isSubmitting = ref(false)
const error = ref('')

// Определяем длинные текстовые поля
const longTextFields = ['answer', 'description', 'info', 'specs']

const isLongText = (col: Column) => {
  return col.type === 'text' && longTextFields.includes(col.name)
}

const getPlaceholder = (col: Column) => {
  const placeholders: Record<string, string> = {
    question: 'Введите вопрос...',
    answer: 'Введите ответ...',
    name: 'Введите название...',
    description: 'Введите описание...',
    topic: 'Введите тему...',
    info: 'Введите информацию...',
    specs: 'Введите характеристики...'
  }
  return placeholders[col.name] || `Введите ${col.label.toLowerCase()}...`
}

const getDefaultValue = (type: string) => {
  switch (type) {
    case 'number': return null
    case 'bool': return false
    case 'date': return ''
    default: return ''
  }
}

const initForm = () => {
  const newForm: Record<string, any> = {}
  
  for (const col of props.columns) {
    if (props.editItem) {
      newForm[col.name] = props.editItem.data[col.name] ?? getDefaultValue(col.type)
    } else {
      newForm[col.name] = getDefaultValue(col.type)
    }
  }
  
  form.value = newForm
}

const handleClose = () => {
  form.value = {}
  error.value = ''
  isSubmitting.value = false
  emit('close')
}

const handleSubmit = () => {
  error.value = ''
  
  // Валидация обязательных полей
  for (const col of props.columns) {
    if (col.required) {
      const value = form.value[col.name]
      if (value === null || value === undefined || value === '') {
        error.value = `Поле "${col.label}" обязательно для заполнения`
        return
      }
    }
  }
  
  isSubmitting.value = true
  
  // Очищаем пустые значения
  const data: Record<string, any> = {}
  for (const col of props.columns) {
    const value = form.value[col.name]
    if (value !== null && value !== undefined && value !== '') {
      data[col.name] = value
    }
  }
  
  emit('submit', data, props.editItem?.id)
}

// Инициализация формы при открытии
watch(() => props.isOpen, (open) => {
  if (open) {
    initForm()
    error.value = ''
    isSubmitting.value = false
  }
})

// Обновление формы при изменении editItem
watch(() => props.editItem, () => {
  if (props.isOpen) {
    initForm()
  }
})

defineExpose({
  setSubmitting: (value: boolean) => { isSubmitting.value = value },
  setError: (err: string) => { error.value = err },
  close: handleClose
})
</script>

<style scoped>
.sheet-slide-enter-active,
.sheet-slide-leave-active {
  transition: transform 0.3s ease;
}

.sheet-slide-enter-from,
.sheet-slide-leave-to {
  transform: translateX(100%);
}
</style>
