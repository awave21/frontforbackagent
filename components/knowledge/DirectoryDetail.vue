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
    <DirectoryDetailToolbar
      :add-disabled="isAddingRow"
      :has-items="items.length > 0"
      :selected-count="Object.keys(rowSelection).length"
      :search-query="globalFilter"
      @add-row="startAddingRow"
      @import="$emit('import')"
      @export="$emit('export')"
      @delete-selected="$emit('deleteSelected', selectedRowIds)"
      @update:search-query="globalFilter = $event"
    />

    <!-- Hint for inline editing -->
    <p v-if="items.length > 0 || isAddingRow" class="text-xs text-slate-400 flex items-center gap-1.5">
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
      v-else-if="items.length === 0 && !globalFilter && !isAddingRow" 
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
            @click="startAddingRow"
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
      v-else-if="table.getRowModel().rows.length === 0 && globalFilter && !isAddingRow" 
      class="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm"
    >
      <p class="text-slate-500">Ничего не найдено по запросу "{{ globalFilter }}"</p>
    </div>

    <!-- Table with TanStack -->
    <div v-else-if="table.getRowModel().rows.length > 0 || isAddingRow" class="shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-12">
                <input
                  type="checkbox"
                  :checked="table.getIsAllPageRowsSelected()"
                  :indeterminate="table.getIsSomePageRowsSelected()"
                  @change="table.toggleAllPageRowsSelected()"
                  class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </TableHead>
              <TableHead
                v-for="header in table.getHeaderGroups()[0].headers.filter(h => h.id !== 'select' && h.id !== 'actions')" 
                :key="header.id"
                draggable="true"
                @dragstart="handleDragStart($event, header.index - 1)"
                @dragover.prevent="handleDragOver($event, header.index - 1)"
                @dragenter.prevent="dragOverIndex = header.index - 1"
                @dragleave="handleDragLeave"
                @drop="handleDrop($event, header.index - 1)"
                @dragend="handleDragEnd"
                :class-name="`cursor-grab select-none transition-all ${dragOverIndex === header.index - 1 && dragIndex !== header.index - 1 ? 'bg-indigo-100 scale-105' : ''} ${dragIndex === header.index - 1 ? 'opacity-50' : ''}`"
                :style="{ minWidth: getColumnWidth(header.column.columnDef.meta as any) }"
              >
                <div class="flex items-center gap-1.5">
                  <GripVertical class="w-3 h-3 text-slate-400" />
                  <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                </div>
              </TableHead>
              <!-- Add Column Button -->
              <InlineAddColumn
                :existing-columns="columns"
                @add="(col) => $emit('addColumn', col)"
              />
              <TableHead class-name="w-16"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <!-- New Row (inline add) -->
            <InlineNewRow 
              v-if="isAddingRow"
              ref="newRowRef"
              :columns="orderedColumns"
              :row-data="newRowData"
              :saving="isSavingNewRow"
              @update:field="(name, val) => newRowData[name] = val"
              @save="saveNewRow"
              @cancel="cancelNewRow"
            />
            <!-- Data Rows -->
            <TableRow 
              v-for="row in table.getRowModel().rows" 
              :key="row.id"
              class="group"
              :class="{ 'bg-indigo-50/30': editingCell?.itemId === row.original.id }"
            >
              <TableCell class-name="px-4 py-2">
                <input
                  type="checkbox"
                  :checked="row.getIsSelected()"
                  @change="row.toggleSelected()"
                  class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </TableCell>
              <TableCell 
                v-for="col in orderedColumns" 
                :key="col.name"
                class-name="px-1 py-1"
                :style="{ minWidth: getColumnWidth(col) }"
              >
                <EditableCell
                  :column="col"
                  :display-value="row.original.data[col.name]"
                  :model-value="editingCell?.itemId === row.original.id && editingCell?.colName === col.name ? editValue : row.original.data[col.name]"
                  :editing="isEditing(row.original.id, col.name)"
                  :saving="isSaving"
                  @update:model-value="editValue = $event"
                  @start-edit="startEdit(row.original, col)"
                  @blur="handleBlur"
                  @keydown="(e) => handleKeydown(e, row.original, col, row.index, orderedColumns.indexOf(col))"
                  @save="saveEdit"
                />
              </TableCell>
              <!-- Empty cell for add column -->
              <TableCell class-name="px-2 py-2 w-40"></TableCell>
              <TableCell class-name="px-4 py-2 w-16">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="$emit('delete', row.original.id)"
                    class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Удалить"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- Pagination -->
      <div v-if="table.getPageCount() > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
        <p class="text-sm text-slate-500">
          Показано {{ table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 }}-{{ Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length) }} из {{ table.getFilteredRowModel().rows.length }}
        </p>
        <div class="flex items-center gap-1">
          <button
            :disabled="!table.getCanPreviousPage()"
            @click="table.previousPage()"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="table.setPageIndex(page - 1)"
            class="min-w-[32px] h-8 px-2 text-sm font-medium rounded-lg transition-colors"
            :class="[
              table.getState().pagination.pageIndex === page - 1
                ? 'bg-indigo-600 text-white' 
                : 'text-slate-600 hover:bg-white'
            ]"
          >
            {{ page }}
          </button>
          <button
            :disabled="!table.getCanNextPage()"
            @click="table.nextPage()"
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
  useVueTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  FlexRender,
  type ColumnDef,
} from '@tanstack/vue-table'
import {
  ArrowLeft,
  Settings,
  Loader2,
  FileText,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  GripVertical,
  Trash2
} from 'lucide-vue-next'
import type { Directory, DirectoryItem, DirectoryColumn } from '~/types/directories'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '~/components/ui/table'
import { pluralize } from '~/utils/pluralize'
import { getColumnWidth as getColWidth } from '~/utils/directory-helpers'

import DirectoryDetailToolbar from './DirectoryDetailToolbar.vue'
import EditableCell from './EditableCell.vue'
import InlineNewRow from './InlineNewRow.vue'
import InlineAddColumn from './InlineAddColumn.vue'

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
  (e: 'create', data: Record<string, any>): void
  (e: 'delete', id: string): void
  (e: 'deleteSelected', ids: string[]): void
  (e: 'addColumn', column: DirectoryColumn & { searchable: boolean }): void
}>()

// --- Inline editing state ---
const editingCell = ref<{ itemId: string; colName: string } | null>(null)
const editValue = ref<any>('')
const originalValue = ref<any>('')
const isSaving = ref(false)

// --- Inline new row state ---
const isAddingRow = ref(false)
const newRowData = ref<Record<string, any>>({})
const isSavingNewRow = ref(false)
const newRowRef = ref<InstanceType<typeof InlineNewRow> | null>(null)

// --- TanStack Table ---
const globalFilter = ref('')
const rowSelection = ref<Record<string, boolean>>({})

const columns = computed(() => props.directory.columns || [])

// Column ordering (drag & drop)
const columnOrder = ref<string[]>([])
const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

watch(() => props.directory.columns, (newCols) => {
  if (newCols && newCols.length > 0) {
    const existingOrder = columnOrder.value.filter(name => newCols.some(c => c.name === name))
    const newColNames = newCols.map(c => c.name).filter(name => !existingOrder.includes(name))
    columnOrder.value = [...existingOrder, ...newColNames]
  }
}, { immediate: true })

const orderedColumns = computed(() => {
  if (columnOrder.value.length === 0) return columns.value
  return columnOrder.value
    .map(name => columns.value.find(c => c.name === name))
    .filter((c): c is DirectoryColumn => c !== undefined)
})

// Build TanStack column defs from ordered columns
const tanstackColumns = computed<ColumnDef<DirectoryItem, any>[]>(() => {
  return orderedColumns.value.map(col => ({
    id: col.name,
    accessorFn: (row: DirectoryItem) => row.data[col.name],
    header: col.label,
    meta: col,
    filterFn: 'includesString',
  }))
})

const table = useVueTable({
  get data() { return props.items },
  get columns() { return tanstackColumns.value },
  state: {
    get globalFilter() { return globalFilter.value },
    get rowSelection() { return rowSelection.value },
  },
  onGlobalFilterChange: (updater) => {
    globalFilter.value = typeof updater === 'function' ? updater(globalFilter.value) : updater
  },
  onRowSelectionChange: (updater) => {
    rowSelection.value = typeof updater === 'function' ? updater(rowSelection.value) : updater
  },
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getRowId: (row) => row.id,
  globalFilterFn: (row, _columnId, filterValue) => {
    const query = String(filterValue).toLowerCase()
    return columns.value.some(col => {
      const value = row.original.data[col.name]
      return value && String(value).toLowerCase().includes(query)
    })
  },
  initialState: {
    pagination: {
      pageSize: 10,
    },
  },
})

const selectedRowIds = computed(() => Object.keys(rowSelection.value).filter(k => rowSelection.value[k]))

const itemsLabel = computed(() =>
  pluralize(props.directory.items_count, ['запись', 'записи', 'записей'])
)

const getColumnWidth = (col: DirectoryColumn) => getColWidth(col.type, col.name)

// --- Visible pages for pagination ---
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = table.getPageCount()
  const current = table.getState().pagination.pageIndex + 1
  
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

// --- Drag & Drop ---
const handleDragStart = (event: DragEvent, index: number) => {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

const handleDragOver = (event: DragEvent, _index: number) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const handleDragLeave = () => {}

const handleDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  if (dragIndex.value === null || dragIndex.value === targetIndex) {
    handleDragEnd()
    return
  }
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

// --- Inline New Row ---
const startAddingRow = () => {
  if (editingCell.value) cancelEdit()
  const data: Record<string, any> = {}
  columns.value.forEach(col => {
    data[col.name] = col.type === 'bool' ? false : ''
  })
  newRowData.value = data
  isAddingRow.value = true
  nextTick(() => newRowRef.value?.focus())
}

const cancelNewRow = () => {
  isAddingRow.value = false
  newRowData.value = {}
}

const saveNewRow = async () => {
  const hasData = Object.values(newRowData.value).some(v => v !== null && v !== undefined && v !== '')
  if (!hasData || isSavingNewRow.value) return
  
  isSavingNewRow.value = true
  try {
    const cleanData: Record<string, any> = {}
    Object.entries(newRowData.value).forEach(([key, value]) => {
      cleanData[key] = value === '' ? null : value
    })
    emit('create', cleanData)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Restart for continuous entry
    const data: Record<string, any> = {}
    columns.value.forEach(col => {
      data[col.name] = col.type === 'bool' ? false : ''
    })
    newRowData.value = data
    nextTick(() => newRowRef.value?.focus())
  } finally {
    isSavingNewRow.value = false
  }
}

// --- Inline Editing ---
const isEditing = (itemId: string, colName: string) =>
  editingCell.value?.itemId === itemId && editingCell.value?.colName === colName

const startEdit = (item: DirectoryItem, col: DirectoryColumn) => {
  if (editingCell.value) saveEdit()
  editingCell.value = { itemId: item.id, colName: col.name }
  const rawValue = item.data[col.name]
  editValue.value = rawValue ?? ''
  originalValue.value = rawValue ?? ''
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
  
  if (newValue === originalValue.value) { cancelEdit(); return }
  
  const item = props.items.find(i => i.id === itemId)
  if (!item) { cancelEdit(); return }
  
  isSaving.value = true
  try {
    const updatedData = { ...item.data, [colName]: newValue === '' ? null : newValue }
    emit('update', itemId, updatedData)
    await new Promise(resolve => setTimeout(resolve, 200))
  } finally {
    isSaving.value = false
    cancelEdit()
  }
}

const handleBlur = () => {
  setTimeout(() => {
    if (editingCell.value) saveEdit()
  }, 150)
}

const handleKeydown = (
  event: KeyboardEvent, 
  item: DirectoryItem, 
  col: DirectoryColumn, 
  rowIndex: number, 
  colIndex: number
) => {
  if (event.key === 'Escape') { event.preventDefault(); cancelEdit(); return }
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); saveEdit(); return }
  
  if (event.key === 'Tab') {
    event.preventDefault()
    saveEdit()
    
    nextTick(() => {
      const cols = orderedColumns.value
      const rows = table.getRowModel().rows
      
      let nextColIndex = event.shiftKey ? colIndex - 1 : colIndex + 1
      let nextRowIndex = rowIndex
      
      if (nextColIndex >= cols.length) { nextColIndex = 0; nextRowIndex = rowIndex + 1 }
      else if (nextColIndex < 0) { nextColIndex = cols.length - 1; nextRowIndex = rowIndex - 1 }
      
      if (nextRowIndex >= 0 && nextRowIndex < rows.length) {
        const nextItem = rows[nextRowIndex].original
        const nextCol = cols[nextColIndex]
        if (nextItem && nextCol) startEdit(nextItem, nextCol)
      }
    })
  }
}

// Reset selection when items change
watch(() => props.items, () => { rowSelection.value = {} })

// Cancel edit when page changes
watch(() => table.getState().pagination.pageIndex, () => { cancelEdit() })
</script>
