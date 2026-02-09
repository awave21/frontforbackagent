<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm font-medium text-slate-700">Колонки справочника</p>
      <button
        type="button"
        @click="addColumn"
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
        :disabled="columns.length >= maxColumns"
        :class="{ 'opacity-50 cursor-not-allowed': columns.length >= maxColumns }"
      >
        <Plus class="w-3.5 h-3.5" />
        Добавить колонку
      </button>
    </div>

    <div v-if="columns.length === 0" class="text-center py-6 bg-slate-50 rounded-md border border-dashed border-slate-200">
      <p class="text-sm text-slate-500">Добавьте хотя бы одну колонку</p>
    </div>

    <draggable
      v-else
      v-model="columns"
      item-key="id"
      handle=".drag-handle"
      ghost-class="opacity-50"
      @change="emitUpdate"
      class="space-y-3"
    >
      <template #item="{ element: col, index }">
        <div class="bg-white border border-slate-200 rounded-md p-4 hover:border-slate-300 transition-colors">
          <div class="flex items-start gap-3">
            <!-- Drag handle -->
            <button type="button" class="drag-handle p-1 text-slate-400 hover:text-slate-600 cursor-grab mt-1">
              <GripVertical class="w-4 h-4" />
            </button>

            <div class="flex-1 grid grid-cols-2 gap-3">
              <!-- Label (отображаемое имя) -->
              <div>
                <label class="text-xs font-medium text-slate-500 mb-1 block">Название</label>
                <input
                  v-model="col.label"
                  type="text"
                  placeholder="Цена"
                  class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
                  @input="generateName(col); emitUpdate()"
                />
              </div>

              <!-- Name (slug для кода) -->
              <div>
                <label class="text-xs font-medium text-slate-500 mb-1 block">Код (slug)</label>
                <input
                  v-model="col.name"
                  type="text"
                  placeholder="price"
                  pattern="^[a-z][a-z0-9_]*$"
                  class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all font-mono"
                  :class="{ 'border-red-300 bg-red-50': !isValidName(col.name) && col.name }"
                  @input="emitUpdate"
                />
              </div>

              <!-- Type -->
              <div>
                <label class="text-xs font-medium text-slate-500 mb-1 block">Тип данных</label>
                <select
                  v-model="col.type"
                  class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
                  @change="emitUpdate"
                >
                  <option value="text">Текст</option>
                  <option value="number">Число</option>
                  <option value="date">Дата</option>
                  <option value="bool">Да/Нет</option>
                </select>
              </div>

              <!-- Flags -->
              <div class="flex items-end gap-4 pb-1">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="col.required"
                    type="checkbox"
                    class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    @change="emitUpdate"
                  />
                  <span class="text-xs text-slate-600">Обязательное</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    v-model="col.searchable"
                    type="checkbox"
                    class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    @change="emitUpdate"
                  />
                  <span class="text-xs text-slate-600">Поиск</span>
                </label>
              </div>
            </div>

            <!-- Delete button -->
            <button
              type="button"
              @click="removeColumn(index)"
              class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-1"
              :disabled="columns.length <= 1"
              :class="{ 'opacity-30 cursor-not-allowed': columns.length <= 1 }"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Validation error -->
          <p v-if="col.name && !isValidName(col.name)" class="mt-2 text-xs text-red-500 ml-8">
            Код должен начинаться с буквы, содержать только a-z, 0-9, _
          </p>
          <p v-if="isDuplicateName(col.name, index)" class="mt-2 text-xs text-red-500 ml-8">
            Код колонки должен быть уникальным
          </p>
        </div>
      </template>
    </draggable>

    <p v-if="columns.length > 0" class="text-xs text-slate-400">
      {{ columns.length }} из {{ maxColumns }} колонок • Перетащите для сортировки
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, GripVertical, Trash2 } from 'lucide-vue-next'
import draggable from 'vuedraggable'
import { transliterate } from '~/utils/translit'
import { isValidSlugName } from '~/utils/directory-helpers'

export type ColumnDefinition = {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  searchable: boolean
}

const props = defineProps<{
  modelValue: ColumnDefinition[]
  maxColumns?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ColumnDefinition[]): void
}>()

const maxColumns = props.maxColumns || 15

const columns = ref<ColumnDefinition[]>([])

// Инициализация
watch(() => props.modelValue, (value) => {
  if (value && value.length > 0) {
    columns.value = value.map(col => ({ ...col, id: col.id || generateId() }))
  }
}, { immediate: true })

const generateId = () => Math.random().toString(36).substring(2, 9)

const generateName = (col: ColumnDefinition) => {
  if (!col.label) {
    col.name = ''
    return
  }
  col.name = transliterate(col.label)
}

const isValidName = (name: string) => isValidSlugName(name)

const isDuplicateName = (name: string, currentIndex: number) => {
  if (!name) return false
  return columns.value.some((col, idx) => idx !== currentIndex && col.name === name)
}

const addColumn = () => {
  if (columns.value.length >= maxColumns) return
  
  columns.value.push({
    id: generateId(),
    name: '',
    label: '',
    type: 'text',
    required: false,
    searchable: false
  })
  emitUpdate()
}

const removeColumn = (index: number) => {
  if (columns.value.length <= 1) return
  columns.value.splice(index, 1)
  emitUpdate()
}

const emitUpdate = () => {
  // Убираем id перед отправкой (он только для UI)
  const cleanColumns = columns.value.map(({ id, ...rest }) => rest)
  emit('update:modelValue', cleanColumns as ColumnDefinition[])
}

// Валидация для родителя
const isValid = () => {
  if (columns.value.length === 0) return false
  
  return columns.value.every(col => 
    col.name && 
    col.label && 
    isValidName(col.name) && 
    !isDuplicateName(col.name, columns.value.indexOf(col))
  )
}

defineExpose({ isValid })
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #f1f5f9;
}
</style>
