<template>
  <Teleport to="body">
    <!-- Overlay with fade -->
    <Transition name="overlay-fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[60] bg-black/40"
        @click="handleClose"
      ></div>
    </Transition>

    <!-- Panel with slide -->
    <Transition name="panel-slide">
      <div
        v-if="isOpen"
        class="fixed right-0 top-0 bottom-0 z-[61] w-full max-w-xl bg-white shadow-xl flex flex-col"
        aria-modal="true"
        role="dialog"
        @click.stop
      >
          <!-- Header -->
          <div class="flex-shrink-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-900">Настройки справочника</h2>
            <button 
              aria-label="Закрыть" 
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" 
              @click="handleClose"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <!-- Basic Info -->
            <div>
              <label class="text-sm font-medium text-slate-700">Название</label>
              <input
                v-model.trim="form.name"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700">Имя функции</label>
              <input
                v-model.trim="form.tool_name"
                type="text"
                class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
                :class="{ 'border-yellow-300 bg-yellow-50': toolNameChanged }"
              />
              <p v-if="toolNameChanged" class="mt-1 text-xs text-yellow-600">
                ⚠️ Изменение повлияет на промпт агента
              </p>
              <p v-if="toolNameError" class="mt-1 text-xs text-red-600">{{ toolNameError }}</p>
            </div>

            <div>
              <label class="text-sm font-medium text-slate-700">Описание для агента</label>
              <textarea
                v-model.trim="form.tool_description"
                rows="3"
                class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all resize-none"
              ></textarea>
            </div>

            <!-- Columns Section -->
            <div class="border-t border-slate-100 pt-6">
              <div class="flex items-center justify-between mb-4">
                <label class="text-sm font-medium text-slate-700">Колонки справочника</label>
                <div class="flex items-center gap-2">
                  <span v-if="hasColumnsChanges" class="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                    Изменения не сохранены
                  </span>
                  <button
                    type="button"
                    @click="showColumnsEditor = !showColumnsEditor"
                    class="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {{ showColumnsEditor ? 'Свернуть' : 'Редактировать' }}
                  </button>
                </div>
              </div>

              <!-- Columns Preview (collapsed) -->
              <div v-if="!showColumnsEditor" class="flex flex-wrap gap-2">
                <span
                  v-for="col in form.columns"
                  :key="col.name"
                  class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600"
                >
                  {{ col.label }}
                  <span class="text-slate-400 ml-1">({{ col.type }})</span>
                  <span v-if="col.required" class="text-red-400 ml-0.5">*</span>
                </span>
              </div>

              <!-- Columns Editor (expanded) -->
              <div v-else class="space-y-3">
                <div
                  v-for="(col, index) in form.columns"
                  :key="index"
                  class="bg-slate-50 border border-slate-200 rounded-xl p-4"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-1 grid grid-cols-2 gap-3">
                      <!-- Label -->
                      <div>
                        <label class="text-xs font-medium text-slate-500 mb-1 block">Название</label>
                        <input
                          v-model="col.label"
                          type="text"
                          placeholder="Цена"
                          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
                          @input="onColumnChange"
                        />
                      </div>

                      <!-- Name (slug) -->
                      <div>
                        <label class="text-xs font-medium text-slate-500 mb-1 block">Код</label>
                        <input
                          v-model="col.name"
                          type="text"
                          placeholder="price"
                          pattern="^[a-z][a-z0-9_]*$"
                          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-mono"
                          :class="{ 'border-red-300 bg-red-50': col.name && !isValidColName(col.name) }"
                          @input="onColumnChange"
                        />
                      </div>

                      <!-- Type -->
                      <div>
                        <label class="text-xs font-medium text-slate-500 mb-1 block">Тип</label>
                        <select
                          v-model="col.type"
                          class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
                          @change="onColumnChange"
                        >
                          <optgroup label="Текст">
                            <option value="text">text</option>
                            <option value="varchar">varchar</option>
                          </optgroup>
                          <optgroup label="Числа">
                            <option value="integer">integer</option>
                            <option value="bigint">bigint</option>
                            <option value="numeric">numeric</option>
                          </optgroup>
                          <optgroup label="Дата/время">
                            <option value="date">date</option>
                            <option value="timestamp">timestamp</option>
                            <option value="time">time</option>
                          </optgroup>
                          <optgroup label="Другое">
                            <option value="boolean">boolean</option>
                            <option value="json">json</option>
                            <option value="uuid">uuid</option>
                            <option value="url">url</option>
                          </optgroup>
                        </select>
                      </div>

                      <!-- Flags -->
                      <div class="flex items-end gap-4 pb-1">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            v-model="col.required"
                            type="checkbox"
                            class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            @change="onColumnChange"
                          />
                          <span class="text-xs text-slate-600">Обяз.</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            v-model="col.searchable"
                            type="checkbox"
                            class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            @change="onColumnChange"
                          />
                          <span class="text-xs text-slate-600">Поиск</span>
                        </label>
                      </div>
                    </div>

                    <!-- Delete column -->
                    <button
                      type="button"
                      @click="removeColumn(index)"
                      class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-5"
                      :disabled="form.columns.length <= 1"
                      :class="{ 'opacity-30 cursor-not-allowed': form.columns.length <= 1 }"
                      title="Удалить колонку"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Validation errors -->
                  <p v-if="col.name && !isValidColName(col.name)" class="mt-2 text-xs text-red-500">
                    Код: только a-z, 0-9, _
                  </p>
                </div>

                <!-- Add column button -->
                <button
                  type="button"
                  @click="addColumn"
                  class="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                  :disabled="form.columns.length >= 15"
                  :class="{ 'opacity-50 cursor-not-allowed': form.columns.length >= 15 }"
                >
                  <Plus class="w-4 h-4" />
                  Добавить колонку
                </button>

                <p v-if="columnsWarning" class="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                  ⚠️ {{ columnsWarning }}
                </p>
              </div>
            </div>

            <!-- Response Mode -->
            <div class="border-t border-slate-100 pt-6">
              <label class="text-sm font-medium text-slate-700 mb-3 block">Режим ответа</label>
              <div class="space-y-3">
                <label 
                  class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
                  :class="[
                    form.response_mode === 'function_result'
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  ]"
                >
                  <input
                    v-model="form.response_mode"
                    type="radio"
                    value="function_result"
                    class="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span class="font-medium text-slate-900 text-sm">Результат функции</span>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Агент получит данные и сформулирует ответ самостоятельно
                    </p>
                  </div>
                </label>
                
                <label 
                  class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all"
                  :class="[
                    form.response_mode === 'direct_message'
                      ? 'border-indigo-300 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  ]"
                >
                  <input
                    v-model="form.response_mode"
                    type="radio"
                    value="direct_message"
                    class="mt-0.5 w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                  />
                  <div>
                    <span class="font-medium text-slate-900 text-sm">Прямое сообщение</span>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Ответ отправится пользователю напрямую без обработки
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Search Type -->
            <div class="border-t border-slate-100 pt-6">
              <label class="text-sm font-medium text-slate-700 mb-3 block">Тип поиска</label>
              <select
                v-model="form.search_type"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all"
              >
                <option value="exact">Точный — совпадение ключевых слов</option>
                <option value="fuzzy">Нечёткий — учитывает опечатки</option>
                <option value="semantic">Семантический — поиск по смыслу</option>
              </select>
            </div>

            <!-- Enabled Toggle -->
            <div class="border-t border-slate-100 pt-6">
              <label class="flex items-center justify-between cursor-pointer">
                <div>
                  <span class="font-medium text-slate-900 text-sm">Справочник активен</span>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Агент сможет использовать этот справочник
                  </p>
                </div>
                <button
                  type="button"
                  @click="form.is_enabled = !form.is_enabled"
                  class="relative w-11 h-6 rounded-full transition-colors"
                  :class="[form.is_enabled ? 'bg-emerald-500' : 'bg-slate-200']"
                >
                  <span
                    class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    :class="[form.is_enabled ? 'left-6' : 'left-1']"
                  ></span>
                </button>
              </label>
            </div>

            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>

          <!-- Footer -->
          <div class="flex-shrink-0 bg-white border-t border-slate-100 px-6 py-4 space-y-3">
            <button
              @click="handleSave"
              class="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              :disabled="isSaving || !isValid"
            >
              <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
              <span>{{ isSaving ? 'Сохранение...' : 'Сохранить' }}</span>
            </button>
            
            <button
              @click="showDeleteConfirm = true"
              class="w-full px-6 py-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
            >
              Удалить справочник
            </button>
          </div>

          <!-- Delete Confirmation -->
          <Transition name="modal-fade">
            <div
              v-if="showDeleteConfirm"
              class="fixed inset-0 z-[70] flex items-center justify-center px-4"
            >
              <div class="fixed inset-0 bg-black/40" @click="showDeleteConfirm = false"></div>
              <div class="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
                <h3 class="text-lg font-bold text-slate-900">Удалить справочник?</h3>
                <p class="text-slate-500 text-sm mt-2">
                  Справочник "{{ directory?.name }}" и все его записи ({{ directory?.items_count }}) будут удалены безвозвратно.
                </p>
                <div class="flex items-center gap-3 mt-6">
                  <button
                    @click="showDeleteConfirm = false"
                    class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    @click="handleDelete"
                    class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
                    :disabled="isDeleting"
                  >
                    {{ isDeleting ? 'Удаление...' : 'Удалить' }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Loader2, Trash2, Plus } from 'lucide-vue-next'

type ColumnDef = {
  name: string
  label: string
  type: string
  required: boolean
  searchable?: boolean
}

type Directory = {
  id: string
  agent_id?: string
  name: string
  slug?: string
  tool_name: string
  tool_description?: string
  template?: string
  columns?: ColumnDef[]
  response_mode?: 'function_result' | 'direct_message'
  search_type?: 'exact' | 'fuzzy' | 'semantic'
  is_enabled: boolean
  items_count: number
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  isOpen: boolean
  directory: Directory | null
  existingToolNames?: string[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Partial<Directory>): void
  (e: 'delete', id: string): void
}>()

const form = ref({
  name: '',
  tool_name: '',
  tool_description: '',
  response_mode: 'function_result' as 'function_result' | 'direct_message',
  search_type: 'fuzzy' as 'exact' | 'fuzzy' | 'semantic',
  is_enabled: true,
  columns: [] as ColumnDef[]
})

const isSaving = ref(false)
const isDeleting = ref(false)
const error = ref('')
const toolNameError = ref('')
const showDeleteConfirm = ref(false)
const showColumnsEditor = ref(false)

const originalToolName = ref('')
const originalColumns = ref<ColumnDef[]>([])

const toolNameChanged = computed(() => {
  return form.value.tool_name !== originalToolName.value
})

const hasColumnsChanges = computed(() => {
  return JSON.stringify(form.value.columns) !== JSON.stringify(originalColumns.value)
})

const columnsWarning = computed(() => {
  if (!hasColumnsChanges.value) return ''
  
  // Проверяем удалённые колонки
  const currentNames = form.value.columns.map(c => c.name)
  const removedCols = originalColumns.value.filter(c => !currentNames.includes(c.name))
  
  if (removedCols.length > 0 && props.directory && props.directory.items_count > 0) {
    return `Удаление колонок (${removedCols.map(c => c.label).join(', ')}) приведёт к потере данных в ${props.directory.items_count} записях`
  }
  
  return ''
})

const isValid = computed(() => {
  if (!form.value.name.trim()) return false
  if (!form.value.tool_name.trim()) return false
  if (!/^[a-z][a-z0-9_]*$/.test(form.value.tool_name)) return false
  if (toolNameError.value) return false
  if (form.value.columns.length === 0) return false
  
  // Валидация колонок
  const colNames = form.value.columns.map(c => c.name)
  const hasInvalidCol = form.value.columns.some(col => 
    !col.name || !col.label || !isValidColName(col.name)
  )
  const hasDuplicates = colNames.length !== new Set(colNames).size
  
  return !hasInvalidCol && !hasDuplicates
})

const isValidColName = (name: string) => {
  return /^[a-z][a-z0-9_]*$/.test(name)
}

const initForm = () => {
  if (props.directory) {
    const cols = (props.directory.columns || []).map(c => ({
      name: c.name,
      label: c.label,
      type: c.type || 'text',
      required: c.required ?? false,
      searchable: c.searchable ?? false
    }))
    
    form.value = {
      name: props.directory.name,
      tool_name: props.directory.tool_name,
      tool_description: props.directory.tool_description || '',
      response_mode: props.directory.response_mode || 'function_result',
      search_type: props.directory.search_type || 'fuzzy',
      is_enabled: props.directory.is_enabled,
      columns: cols
    }
    originalToolName.value = props.directory.tool_name
    originalColumns.value = JSON.parse(JSON.stringify(cols))
  }
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
  
  const otherNames = props.existingToolNames?.filter(n => n !== originalToolName.value) || []
  if (otherNames.includes(toolName)) {
    toolNameError.value = 'Такое имя функции уже существует'
    return
  }
  
  toolNameError.value = ''
}

const addColumn = () => {
  if (form.value.columns.length >= 15) return
  
  form.value.columns.push({
    name: '',
    label: '',
    type: 'text',
    required: false,
    searchable: false
  })
}

const removeColumn = (index: number) => {
  if (form.value.columns.length <= 1) return
  form.value.columns.splice(index, 1)
}

const onColumnChange = () => {
  // Триггер реактивности
}

const handleClose = () => {
  error.value = ''
  toolNameError.value = ''
  showDeleteConfirm.value = false
  showColumnsEditor.value = false
  isSaving.value = false
  isDeleting.value = false
  emit('close')
}

const handleSave = () => {
  if (!isValid.value || !props.directory) return
  
  error.value = ''
  isSaving.value = true
  
  emit('save', {
    id: props.directory.id,
    name: form.value.name,
    tool_name: form.value.tool_name,
    tool_description: form.value.tool_description,
    response_mode: form.value.response_mode,
    search_type: form.value.search_type,
    is_enabled: form.value.is_enabled,
    columns: form.value.columns
  })
}

const handleDelete = () => {
  if (!props.directory) return
  isDeleting.value = true
  emit('delete', props.directory.id)
}

watch(() => props.isOpen, (open) => {
  if (open) {
    initForm()
    error.value = ''
    toolNameError.value = ''
    showDeleteConfirm.value = false
    showColumnsEditor.value = false
  }
})

watch(() => form.value.tool_name, () => {
  validateToolName()
})

defineExpose({
  setSaving: (value: boolean) => { isSaving.value = value },
  setDeleting: (value: boolean) => { isDeleting.value = value },
  setError: (err: string) => { error.value = err },
  close: handleClose
})
</script>

<style scoped>
/* Overlay fades */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.25s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

/* Panel slides from right */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s ease;
}
.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
