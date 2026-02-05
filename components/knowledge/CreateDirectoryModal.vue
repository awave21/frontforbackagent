<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 sm:px-6"
        aria-modal="true"
        role="dialog"
      >
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="handleClose"></div>
        <div
          class="relative w-full overflow-hidden rounded-2xl bg-white shadow-xl shadow-indigo-900/20 ring-1 ring-indigo-100"
          :class="[step === 'columns' ? 'max-w-3xl' : 'max-w-xl']"
          @click.stop
        >
          <!-- Step 1: Template Selection -->
          <div v-if="step === 'template'" class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-bold text-slate-900">Создать справочник</h2>
                <p class="text-sm text-slate-500 mt-1">Выберите тип справочника</p>
              </div>
              <button 
                aria-label="Закрыть" 
                class="text-slate-400 hover:text-slate-600 p-1" 
                @click="handleClose"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="tpl in templates"
                :key="tpl.id"
                @click="selectTemplate(tpl.id)"
                class="flex flex-col items-start p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left group"
                :class="[
                  selectedTemplate === tpl.id ? 'border-indigo-400 bg-indigo-50' : '',
                  tpl.id === 'ai_generate' ? 'opacity-50 cursor-not-allowed' : ''
                ]"
                :disabled="tpl.id === 'ai_generate'"
              >
                <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  :class="[
                    selectedTemplate === tpl.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  ]"
                >
                  <component :is="tpl.icon" class="w-5 h-5" />
                </div>
                <span class="font-bold text-slate-900 text-sm">{{ tpl.label }}</span>
                <span class="text-xs text-slate-500 mt-1">{{ tpl.description }}</span>
                <span v-if="tpl.id === 'ai_generate'" class="text-[10px] text-slate-400 mt-1">Скоро</span>
              </button>
            </div>

            <div class="flex justify-end mt-6">
              <button
                :disabled="!selectedTemplate"
                @click="goToDetails"
                class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Далее
              </button>
            </div>
          </div>

          <!-- Step 2: Details Form -->
          <div v-else-if="step === 'details'" class="p-6">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <button 
                  @click="step = 'template'" 
                  class="p-1 text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft class="h-5 w-5" />
                </button>
                <div>
                  <h2 class="text-lg font-bold text-slate-900">Настройка справочника</h2>
                  <p class="text-sm text-slate-500 mt-0.5">{{ selectedTemplateData?.label }}</p>
                </div>
              </div>
              <button 
                aria-label="Закрыть" 
                class="text-slate-400 hover:text-slate-600 p-1" 
                @click="handleClose"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <form @submit.prevent="handleDetailsNext" class="space-y-5">
              <div>
                <label class="text-sm font-medium text-slate-700">
                  Название справочника <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.trim="form.name"
                  type="text"
                  required
                  placeholder="Услуги клиники"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                  @input="generateToolName"
                />
              </div>

              <div>
                <label class="text-sm font-medium text-slate-700">
                  Имя функции для агента <span class="text-red-500">*</span>
                </label>
                <div class="relative mt-1">
                  <input
                    v-model.trim="form.tool_name"
                    type="text"
                    required
                    placeholder="get_services"
                    pattern="^[a-z][a-z0-9_]*$"
                    class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                    :class="{ 'border-red-300 bg-red-50': toolNameError }"
                  />
                </div>
                <p v-if="toolNameError" class="mt-1 text-xs text-red-600">{{ toolNameError }}</p>
                <p v-else class="mt-1 text-xs text-slate-500">
                  Латиница, цифры и _ • Уникальное в рамках агента
                </p>
              </div>

              <div>
                <label class="text-sm font-medium text-slate-700">Описание для агента</label>
                <textarea
                  v-model.trim="form.tool_description"
                  rows="3"
                  :placeholder="selectedTemplateData?.defaultDescription"
                  class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all resize-none"
                ></textarea>
                <p class="mt-1 text-xs text-slate-500">
                  Помогает агенту понять когда использовать этот справочник
                </p>
              </div>

              <!-- Preview columns for template-based -->
              <div v-if="selectedTemplate !== 'custom'" class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Колонки справочника</p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="col in selectedTemplateData?.columns"
                    :key="col.name"
                    class="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-600"
                  >
                    {{ col.label }}
                    <span class="text-slate-400 ml-1">({{ col.type }})</span>
                    <span v-if="col.required" class="text-red-400">*</span>
                  </span>
                </div>
              </div>

              <p v-if="submitError" class="text-sm text-red-600">{{ submitError }}</p>

              <div class="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  class="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  @click="handleClose"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  :disabled="!isDetailsValid"
                >
                  <span>{{ selectedTemplate === 'custom' ? 'Далее' : 'Создать' }}</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Custom Columns Editor -->
          <div v-else-if="step === 'columns'" class="flex flex-col max-h-[85vh]">
            <div class="flex items-center justify-between p-6 border-b border-slate-100">
              <div class="flex items-center gap-3">
                <button 
                  @click="step = 'details'" 
                  class="p-1 text-slate-400 hover:text-slate-600"
                >
                  <ArrowLeft class="h-5 w-5" />
                </button>
                <div>
                  <h2 class="text-lg font-bold text-slate-900">Настройка колонок</h2>
                  <p class="text-sm text-slate-500 mt-0.5">{{ form.name || 'Произвольный справочник' }}</p>
                </div>
              </div>
              <button 
                aria-label="Закрыть" 
                class="text-slate-400 hover:text-slate-600 p-1" 
                @click="handleClose"
              >
                <X class="h-5 w-5" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-6">
              <ColumnEditor
                v-model="customColumns"
                :max-columns="15"
                ref="columnEditorRef"
              />
            </div>

            <div class="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                class="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                @click="handleClose"
              >
                Отмена
              </button>
              <button
                @click="handleSubmit"
                class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                :disabled="isSubmitting || !isColumnsValid"
              >
                <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" />
                <span>{{ isSubmitting ? 'Создание...' : 'Создать' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { 
  X, 
  ArrowLeft,
  Loader2,
  HelpCircle, 
  Tag, 
  Package, 
  Building2, 
  Sparkles,
  List
} from 'lucide-vue-next'
import ColumnEditor, { type ColumnDefinition } from './ColumnEditor.vue'

const props = defineProps<{
  isOpen: boolean
  existingToolNames?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: {
    name: string
    tool_name: string
    tool_description: string
    template: string
    columns: ColumnDefinition[]
  }): void
}>()

type TemplateColumn = {
  name: string
  label: string
  type: string
  required: boolean
  searchable?: boolean
}

type Template = {
  id: string
  label: string
  description: string
  icon: any
  columns: TemplateColumn[]
  defaultDescription: string
}

const templates: Template[] = [
  {
    id: 'qa',
    label: 'Вопрос-ответ',
    description: 'Пары вопросов и ответов',
    icon: HelpCircle,
    columns: [
      { name: 'question', label: 'Вопрос', type: 'text', required: true, searchable: true },
      { name: 'answer', label: 'Ответ', type: 'text', required: true, searchable: false },
    ],
    defaultDescription: 'Найти ответ на часто задаваемый вопрос'
  },
  {
    id: 'service_catalog',
    label: 'Каталог услуг',
    description: 'Название, описание, цена',
    icon: Tag,
    columns: [
      { name: 'name', label: 'Название', type: 'text', required: true, searchable: true },
      { name: 'description', label: 'Описание', type: 'text', required: false, searchable: true },
      { name: 'price', label: 'Цена', type: 'numeric', required: false, searchable: false },
    ],
    defaultDescription: 'Найти услугу по названию или описанию'
  },
  {
    id: 'product_catalog',
    label: 'Каталог товаров',
    description: 'С ценами и характеристиками',
    icon: Package,
    columns: [
      { name: 'name', label: 'Название', type: 'text', required: true, searchable: true },
      { name: 'description', label: 'Описание', type: 'text', required: false, searchable: true },
      { name: 'price', label: 'Цена', type: 'numeric', required: false, searchable: false },
      { name: 'specs', label: 'Характеристики', type: 'text', required: false, searchable: true },
    ],
    defaultDescription: 'Найти товар по названию, описанию или характеристикам'
  },
  {
    id: 'company_info',
    label: 'О компании',
    description: 'Тема → информация',
    icon: Building2,
    columns: [
      { name: 'topic', label: 'Тема', type: 'text', required: true, searchable: true },
      { name: 'info', label: 'Информация', type: 'text', required: true, searchable: true },
    ],
    defaultDescription: 'Получить информацию о компании по теме'
  },
  {
    id: 'custom',
    label: 'Произвольный',
    description: 'Задайте свои колонки',
    icon: List,
    columns: [],
    defaultDescription: 'Поиск по справочнику'
  },
  {
    id: 'ai_generate',
    label: 'Создать с ИИ',
    description: 'Опишите — ИИ сгенерирует',
    icon: Sparkles,
    columns: [],
    defaultDescription: ''
  },
]

const step = ref<'template' | 'details' | 'columns'>('template')
const selectedTemplate = ref<string | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')
const toolNameError = ref('')

const form = ref({
  name: '',
  tool_name: '',
  tool_description: ''
})

const customColumns = ref<ColumnDefinition[]>([
  { id: '1', name: '', label: '', type: 'text', required: true, searchable: true }
])

const columnEditorRef = ref<InstanceType<typeof ColumnEditor> | null>(null)

const selectedTemplateData = computed(() => {
  return templates.find(t => t.id === selectedTemplate.value)
})

const isDetailsValid = computed(() => {
  return form.value.name.trim() && 
         form.value.tool_name.trim() && 
         /^[a-z][a-z0-9_]*$/.test(form.value.tool_name) &&
         !toolNameError.value
})

const isColumnsValid = computed(() => {
  if (customColumns.value.length === 0) return false
  return customColumns.value.every(col => 
    col.name && 
    col.label && 
    /^[a-z][a-z0-9_]*$/.test(col.name)
  )
})

const selectTemplate = (id: string) => {
  if (id === 'ai_generate') return
  selectedTemplate.value = id
}

const goToDetails = () => {
  if (!selectedTemplate.value) return
  step.value = 'details'
}

const translitMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '_', '-': '_'
}

const generateToolName = () => {
  const name = form.value.name.toLowerCase()
  let result = ''
  for (const char of name) {
    result += translitMap[char] ?? char
  }
  result = result.replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_')
  
  if (result && !result.startsWith('get_')) {
    result = 'get_' + result
  }
  
  form.value.tool_name = result
  validateToolName()
}

const validateToolName = () => {
  const toolName = form.value.tool_name
  if (!toolName) {
    toolNameError.value = ''
    return
  }
  
  if (!/^[a-z][a-z0-9_]*$/.test(toolName)) {
    toolNameError.value = 'Только латиница в нижнем регистре, цифры и _'
    return
  }
  
  if (props.existingToolNames?.includes(toolName)) {
    toolNameError.value = 'Такое имя функции уже существует'
    return
  }
  
  toolNameError.value = ''
}

const handleDetailsNext = () => {
  if (!isDetailsValid.value) return
  
  if (selectedTemplate.value === 'custom') {
    step.value = 'columns'
  } else {
    handleSubmit()
  }
}

const resetForm = () => {
  step.value = 'template'
  selectedTemplate.value = null
  form.value = { name: '', tool_name: '', tool_description: '' }
  customColumns.value = [{ id: '1', name: '', label: '', type: 'text', required: true, searchable: true }]
  submitError.value = ''
  toolNameError.value = ''
  isSubmitting.value = false
}

const handleClose = () => {
  resetForm()
  emit('close')
}

const handleSubmit = () => {
  if (!selectedTemplate.value) return
  
  submitError.value = ''
  isSubmitting.value = true
  
  // Определяем колонки
  let columns: ColumnDefinition[]
  if (selectedTemplate.value === 'custom') {
    if (!isColumnsValid.value) {
      submitError.value = 'Заполните все колонки корректно'
      isSubmitting.value = false
      return
    }
    columns = customColumns.value.map(({ id, ...rest }) => rest) as ColumnDefinition[]
  } else {
    columns = (selectedTemplateData.value?.columns || []).map(col => ({
      ...col,
      searchable: col.searchable ?? false
    })) as ColumnDefinition[]
  }
  
  emit('submit', {
    name: form.value.name,
    tool_name: form.value.tool_name,
    tool_description: form.value.tool_description || selectedTemplateData.value?.defaultDescription || '',
    template: selectedTemplate.value,
    columns
  })
}

watch(() => props.isOpen, (open) => {
  if (open) {
    resetForm()
  }
})

watch(() => form.value.tool_name, () => {
  validateToolName()
})

defineExpose({
  setSubmitting: (value: boolean) => { isSubmitting.value = value },
  setError: (error: string) => { submitError.value = error },
  close: handleClose
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
