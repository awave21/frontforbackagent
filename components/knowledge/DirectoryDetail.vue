<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3 min-w-0">
        <button
          @click="$emit('back')"
          class="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm font-medium"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Все справочники</span>
        </button>
        <div class="w-px h-6 bg-slate-200"></div>
        <div class="min-w-0">
          <h3 class="text-lg font-bold text-slate-900 truncate">{{ directory.name }}</h3>
          <p class="text-xs text-slate-500">
            <span class="font-mono text-slate-400">{{ directory.tool_name }}</span>
            <span class="mx-1.5">•</span>
            <span>{{ directory.items_count }} {{ itemsLabel }}</span>
          </p>
        </div>
      </div>
      <button
        @click="$emit('settings')"
        class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="Настройки"
      >
        <Settings class="w-5 h-5" />
      </button>
    </div>

    <!-- Actions Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-slate-200 p-3">
      <div class="flex items-center gap-2">
        <button
          @click="$emit('add')"
          class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Добавить
        </button>
        <button
          @click="$emit('import')"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <Upload class="w-4 h-4" />
          Загрузить CSV
        </button>
        <button
          @click="$emit('export')"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          :disabled="items.length === 0"
          :class="{ 'opacity-50 cursor-not-allowed': items.length === 0 }"
        >
          <Download class="w-4 h-4" />
          Экспорт
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedIds.length > 0"
          @click="$emit('deleteSelected', selectedIds)"
          class="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <Trash2 class="w-4 h-4" />
          Удалить ({{ selectedIds.length }})
        </button>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Поиск..."
            class="pl-9 pr-4 py-2 w-48 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>
    </div>

    <!-- Hint for inline editing -->
    <p v-if="items.length > 0" class="text-xs text-slate-400 flex items-center gap-1.5">
      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">
        <MousePointer class="w-3 h-3" />
        Клик
      </span>
      для редактирования ячейки
      <span class="mx-1">•</span>
      <span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Tab</span>
      следующая
      <span class="mx-1">•</span>
      <span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Enter</span>
      сохранить
      <span class="mx-1">•</span>
      <span class="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 font-mono text-[10px]">Esc</span>
      отмена
    </p>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="items.length === 0 && !searchQuery" 
      class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm"
    >
      <div class="max-w-md mx-auto">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText class="h-8 w-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-900">Записей пока нет</h3>
        <p class="text-slate-500 mt-2 mb-6">
          Добавьте записи вручную или загрузите из CSV-файла
        </p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="$emit('add')"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            Добавить запись
          </button>
          <button
            @click="$emit('import')"
            class="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Загрузить CSV
          </button>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div 
      v-else-if="filteredItems.length === 0 && searchQuery" 
      class="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm"
    >
      <p class="text-slate-500">Ничего не найдено по запросу "{{ searchQuery }}"</p>
    </div>

    <!-- Table with Inline Editing -->
    <div v-else class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100 bg-slate-50">
              <th class="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isPartialSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th 
                v-for="(col, colIndex) in orderedColumns" 
                :key="col.name"
                draggable="true"
                @dragstart="handleDragStart($event, colIndex)"
                @dragover.prevent="handleDragOver($event, colIndex)"
                @dragenter.prevent="dragOverIndex = colIndex"
                @dragleave="handleDragLeave"
                @drop="handleDrop($event, colIndex)"
                @dragend="handleDragEnd"
                class="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-grab select-none transition-all"
                :class="{
                  'bg-indigo-100 scale-105': dragOverIndex === colIndex && dragIndex !== colIndex,
                  'opacity-50': dragIndex === colIndex
                }"
                :style="{ minWidth: getColumnWidth(col) }"
              >
                <div class="flex items-center gap-1.5">
                  <GripVertical class="w-3 h-3 text-slate-400" />
                  {{ col.label }}
                </div>
              </th>
              <!-- Add Column Button -->
              <th class="px-2 py-3 w-40">
                <div v-if="!showAddColumn" class="flex justify-center">
                  <button
                    @click="showAddColumn = true"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Добавить столбец"
                  >
                    <Plus class="w-3.5 h-3.5" />
                    Столбец
                  </button>
                </div>
                <!-- Inline Add Column Form -->
                <div v-else class="flex flex-col gap-2 min-w-[200px]">
                  <input
                    ref="newColumnLabelRef"
                    v-model="newColumn.label"
                    type="text"
                    placeholder="Название"
                    class="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                    @input="generateColumnName"
                    @keydown.enter="addColumn"
                    @keydown.escape="cancelAddColumn"
                  />
                  <select
                    v-model="newColumn.type"
                    class="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:border-indigo-400"
                  >
                    <option value="text">Текст</option>
                    <option value="number">Число</option>
                    <option value="date">Дата</option>
                    <option value="bool">Да/Нет</option>
                  </select>
                  <div class="flex gap-1">
                    <button
                      @click="addColumn"
                      :disabled="!newColumn.label || !newColumn.name"
                      class="flex-1 px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Добавить
                    </button>
                    <button
                      @click="cancelAddColumn"
                      class="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </th>
              <th class="w-16 px-4 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="(item, rowIndex) in paginatedItems" 
              :key="item.id"
              class="group"
              :class="{ 'bg-indigo-50/30': isRowEditing(item.id) }"
            >
              <td class="px-4 py-2">
                <input
                  type="checkbox"
                  :checked="selectedIds.includes(item.id)"
                  @change="toggleSelect(item.id)"
                  class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td 
                v-for="(col, colIndex) in orderedColumns" 
                :key="col.name"
                class="px-1 py-1"
                :style="{ minWidth: getColumnWidth(col) }"
              >
                <!-- Editing Mode -->
                <div 
                  v-if="isEditing(item.id, col.name)"
                  class="relative"
                >
                  <textarea
                    v-if="col.type === 'text' && isLongText(col.name)"
                    ref="editInputRef"
                    v-model="editValue"
                    :placeholder="col.label"
                    rows="3"
                    class="w-full px-3 py-2 text-sm border-2 border-indigo-400 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                    @blur="handleBlur"
                    @keydown="handleKeydown($event, item, col, rowIndex, colIndex)"
                  />
                  <input
                    v-else-if="col.type === 'number'"
                    ref="editInputRef"
                    v-model.number="editValue"
                    type="number"
                    step="any"
                    :placeholder="col.label"
                    class="w-full px-3 py-2 text-sm border-2 border-indigo-400 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 font-mono"
                    @blur="handleBlur"
                    @keydown="handleKeydown($event, item, col, rowIndex, colIndex)"
                  />
                  <input
                    v-else-if="col.type === 'date'"
                    ref="editInputRef"
                    v-model="editValue"
                    type="date"
                    class="w-full px-3 py-2 text-sm border-2 border-indigo-400 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    @blur="handleBlur"
                    @keydown="handleKeydown($event, item, col, rowIndex, colIndex)"
                  />
                  <label
                    v-else-if="col.type === 'bool'"
                    class="flex items-center gap-2 px-3 py-2 cursor-pointer"
                  >
                    <input
                      ref="editInputRef"
                      v-model="editValue"
                      type="checkbox"
                      class="w-5 h-5 rounded border-indigo-400 text-indigo-600 focus:ring-indigo-500"
                      @change="saveEdit"
                    />
                    <span class="text-sm">{{ editValue ? 'Да' : 'Нет' }}</span>
                  </label>
                  <input
                    v-else
                    ref="editInputRef"
                    v-model="editValue"
                    type="text"
                    :placeholder="col.label"
                    class="w-full px-3 py-2 text-sm border-2 border-indigo-400 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    @blur="handleBlur"
                    @keydown="handleKeydown($event, item, col, rowIndex, colIndex)"
                  />
                  <!-- Saving indicator -->
                  <div 
                    v-if="isSaving"
                    class="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <Loader2 class="w-4 h-4 animate-spin text-indigo-500" />
                  </div>
                </div>
                <!-- Display Mode -->
                <div 
                  v-else
                  @click="startEdit(item, col)"
                  class="px-3 py-2 text-sm text-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors min-h-[36px] flex items-center"
                  :class="{ 
                    'font-mono': col.type === 'number',
                    'text-slate-400 italic': item.data[col.name] === null || item.data[col.name] === undefined || item.data[col.name] === ''
                  }"
                >
                  <!-- Bool display -->
                  <span v-if="col.type === 'bool'" class="flex items-center gap-1.5">
                    <span 
                      class="w-4 h-4 rounded flex items-center justify-center text-white text-xs"
                      :class="item.data[col.name] ? 'bg-green-500' : 'bg-slate-300'"
                    >
                      {{ item.data[col.name] ? '✓' : '' }}
                    </span>
                    <span :class="item.data[col.name] ? 'text-green-700' : 'text-slate-400'">
                      {{ item.data[col.name] ? 'Да' : 'Нет' }}
                    </span>
                  </span>
                  <!-- Other types -->
                  <span v-else class="line-clamp-2">
                    {{ formatValue(item.data[col.name], col.type) || 'Пусто' }}
                  </span>
                </div>
              </td>
              <!-- Empty cell for add column -->
              <td class="px-2 py-2 w-40"></td>
              <td class="px-4 py-2 w-16">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="$emit('delete', item.id)"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
        <p class="text-sm text-slate-500">
          Показано {{ startIndex + 1 }}-{{ endIndex }} из {{ filteredItems.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="currentPage === 1"
            @click="currentPage--"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            class="min-w-[32px] h-8 px-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              currentPage === page 
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-600 hover:bg-white'
            ]"
          >
            {{ page }}
          </button>
          <button
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import {
  ArrowLeft,
  Settings,
  Plus,
  Upload,
  Download,
  Search,
  Trash2,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  GripVertical
} from 'lucide-vue-next'

type Column = {
  name: string
  label: string
  type: string
  required: boolean
}

type DirectoryItem = {
  id: string
  directory_id?: string
  data: Record<string, any>
  created_at?: string
  updated_at?: string
}

type Directory = {
  id: string
  agent_id?: string
  name: string
  slug?: string
  tool_name: string
  tool_description?: string
  template: string
  columns: Column[]
  response_mode?: string
  search_type?: string
  items_count: number
  is_enabled: boolean
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  directory: Directory
  items: DirectoryItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'settings'): void
  (e: 'add'): void
  (e: 'import'): void
  (e: 'export'): void
  (e: 'edit', item: DirectoryItem): void
  (e: 'update', itemId: string, data: Record<string, any>): void
  (e: 'delete', id: string): void
  (e: 'deleteSelected', ids: string[]): void
  (e: 'addColumn', column: { name: string; label: string; type: string; required: boolean; searchable: boolean }): void
}>()

const searchQuery = ref('')
const selectedIds = ref<string[]>([])
const currentPage = ref(1)
const itemsPerPage = 10

// Inline editing state
const editingCell = ref<{ itemId: string; colName: string } | null>(null)
const editValue = ref<any>('')
const originalValue = ref<any>('')
const isSaving = ref(false)
const editInputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

// Add column state
const showAddColumn = ref(false)
const newColumnLabelRef = ref<HTMLInputElement | null>(null)
const newColumn = ref({
  label: '',
  name: '',
  type: 'text'
})

// Транслитерация для генерации name из label
const translitMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '',
  'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '_', '-': '_'
}

const generateColumnName = () => {
  if (!newColumn.value.label) {
    newColumn.value.name = ''
    return
  }
  const label = newColumn.value.label.toLowerCase()
  let result = ''
  for (const char of label) {
    result += translitMap[char] ?? char
  }
  newColumn.value.name = result.replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').substring(0, 50)
}

const addColumn = () => {
  if (!newColumn.value.label || !newColumn.value.name) return
  
  // Проверка уникальности имени
  if (columns.value.some(c => c.name === newColumn.value.name)) {
    alert('Столбец с таким именем уже существует')
    return
  }
  
  emit('addColumn', {
    name: newColumn.value.name,
    label: newColumn.value.label,
    type: newColumn.value.type,
    required: false,
    searchable: false
  })
  
  cancelAddColumn()
}

const cancelAddColumn = () => {
  showAddColumn.value = false
  newColumn.value = { label: '', name: '', type: 'text' }
}

// Focus input when showing add column form
watch(showAddColumn, (show) => {
  if (show) {
    nextTick(() => {
      newColumnLabelRef.value?.focus()
    })
  }
})

const columns = computed(() => props.directory.columns || [])

// Column ordering (drag & drop)
const columnOrder = ref<string[]>([])
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// Initialize column order when columns change
watch(() => props.directory.columns, (newCols) => {
  if (newCols && newCols.length > 0) {
    // Preserve existing order, add new columns at the end
    const existingOrder = columnOrder.value.filter(name => newCols.some(c => c.name === name))
    const newColNames = newCols.map(c => c.name).filter(name => !existingOrder.includes(name))
    columnOrder.value = [...existingOrder, ...newColNames]
  }
}, { immediate: true })

// Ordered columns based on user drag & drop
const orderedColumns = computed(() => {
  if (columnOrder.value.length === 0) return columns.value
  return columnOrder.value
    .map(name => columns.value.find(c => c.name === name))
    .filter((c): c is Column => c !== undefined)
})

// Drag & drop handlers
const handleDragStart = (event: DragEvent, index: number) => {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const handleDragOver = (event: DragEvent, index: number) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragLeave = () => {
  // Don't clear immediately to avoid flicker
}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  
  if (dragIndex.value === null || dragIndex.value === targetIndex) {
    handleDragEnd()
    return
  }
  
  // Reorder columns
  const newOrder = [...columnOrder.value]
  const [movedItem] = newOrder.splice(dragIndex.value, 1)
  newOrder.splice(targetIndex, 0, movedItem)
  columnOrder.value = newOrder
  
  handleDragEnd()
}

const handleDragEnd = () => {
  dragIndex.value = null
  dragOverIndex.value = null
}

// Long text fields that should use textarea
const longTextFields = ['answer', 'description', 'info', 'specs']

const isLongText = (colName: string) => longTextFields.includes(colName)

const getColumnWidth = (col: Column) => {
  if (col.type === 'number') return '120px'
  if (isLongText(col.name)) return '250px'
  return '180px'
}

const itemsLabel = computed(() => {
  const count = props.directory.items_count
  if (count === 0) return 'записей'
  if (count === 1) return 'запись'
  if (count >= 2 && count <= 4) return 'записи'
  if (count >= 5 && count <= 20) return 'записей'
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'записей'
  if (lastDigit === 1) return 'запись'
  if (lastDigit >= 2 && lastDigit <= 4) return 'записи'
  return 'записей'
})

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.items
  }
  const query = searchQuery.value.toLowerCase()
  return props.items.filter(item => {
    return columns.value.some(col => {
      const value = item.data[col.name]
      return value && String(value).toLowerCase().includes(query)
    })
  })
})

const totalPages = computed(() => Math.ceil(filteredItems.value.length / itemsPerPage))

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, filteredItems.value.length))

const paginatedItems = computed(() => {
  return filteredItems.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5)
    } else if (current >= total - 2) {
      pages.push(total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(current - 2, current - 1, current, current + 1, current + 2)
    }
  }
  return pages
})

const isAllSelected = computed(() => {
  return paginatedItems.value.length > 0 && 
         paginatedItems.value.every(item => selectedIds.value.includes(item.id))
})

const isPartialSelected = computed(() => {
  return paginatedItems.value.some(item => selectedIds.value.includes(item.id)) && !isAllSelected.value
})

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = selectedIds.value.filter(
      id => !paginatedItems.value.some(item => item.id === id)
    )
  } else {
    const newIds = paginatedItems.value.map(item => item.id)
    selectedIds.value = [...new Set([...selectedIds.value, ...newIds])]
  }
}

const toggleSelect = (id: string) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    selectedIds.value.push(id)
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const formatValue = (value: any, type: string) => {
  if (value === null || value === undefined || value === '') return ''
  
  switch (type) {
    case 'number':
      return typeof value === 'number' ? value.toLocaleString('ru-RU') : String(value)
    case 'date':
      // Format YYYY-MM-DD to DD.MM.YYYY for display
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-')
        return `${d}.${m}.${y}`
      }
      return String(value)
    case 'bool':
      return value ? 'Да' : 'Нет'
    default:
      return String(value)
  }
}

// Inline editing functions
const isEditing = (itemId: string, colName: string) => {
  return editingCell.value?.itemId === itemId && editingCell.value?.colName === colName
}

const isRowEditing = (itemId: string) => {
  return editingCell.value?.itemId === itemId
}

const startEdit = (item: DirectoryItem, col: Column) => {
  // Cancel any pending save
  if (editingCell.value) {
    saveEdit()
  }
  
  editingCell.value = { itemId: item.id, colName: col.name }
  const rawValue = item.data[col.name]
  editValue.value = rawValue ?? ''
  originalValue.value = rawValue ?? ''
  
  nextTick(() => {
    const input = editInputRef.value
    if (input) {
      if (Array.isArray(input)) {
        input[0]?.focus()
        input[0]?.select?.()
      } else {
        input.focus()
        ;(input as HTMLInputElement).select?.()
      }
    }
  })
}

const cancelEdit = () => {
  editingCell.value = null
  editValue.value = ''
  originalValue.value = ''
}

const saveEdit = async () => {
  if (!editingCell.value || isSaving.value) return
  
  const { itemId, colName } = editingCell.value
  const newValue = editValue.value
  
  // Skip if value hasn't changed
  if (newValue === originalValue.value) {
    cancelEdit()
    return
  }
  
  // Find the item and create updated data
  const item = props.items.find(i => i.id === itemId)
  if (!item) {
    cancelEdit()
    return
  }
  
  isSaving.value = true
  
  try {
    const updatedData = {
      ...item.data,
      [colName]: newValue === '' ? null : newValue
    }
    
    emit('update', itemId, updatedData)
    
    // Small delay to show saving indicator
    await new Promise(resolve => setTimeout(resolve, 200))
  } finally {
    isSaving.value = false
    cancelEdit()
  }
}

const handleBlur = () => {
  // Small delay to allow Tab navigation to work
  setTimeout(() => {
    if (editingCell.value) {
      saveEdit()
    }
  }, 150)
}

const handleKeydown = (
  event: KeyboardEvent, 
  item: DirectoryItem, 
  col: Column, 
  rowIndex: number, 
  colIndex: number
) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelEdit()
    return
  }
  
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    saveEdit()
    return
  }
  
  if (event.key === 'Tab') {
    event.preventDefault()
    saveEdit()
    
    // Navigate to next/previous cell
    nextTick(() => {
      const cols = columns.value
      const items = paginatedItems.value
      
      let nextColIndex = event.shiftKey ? colIndex - 1 : colIndex + 1
      let nextRowIndex = rowIndex
      
      // Move to next/previous row if needed
      if (nextColIndex >= cols.length) {
        nextColIndex = 0
        nextRowIndex = rowIndex + 1
      } else if (nextColIndex < 0) {
        nextColIndex = cols.length - 1
        nextRowIndex = rowIndex - 1
      }
      
      // Check bounds
      if (nextRowIndex >= 0 && nextRowIndex < items.length) {
        const nextItem = items[nextRowIndex]
        const nextCol = cols[nextColIndex]
        if (nextItem && nextCol) {
          startEdit(nextItem, nextCol)
        }
      }
    })
  }
}

// Reset pagination when search changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Reset selection when items change
watch(() => props.items, () => {
  selectedIds.value = []
})

// Cancel edit when page changes
watch(currentPage, () => {
  cancelEdit()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
