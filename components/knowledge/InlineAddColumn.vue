<template>
  <TableHead class-name="w-40">
    <div v-if="!isAdding" class="flex justify-center">
      <button
        @click="startAdding"
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
        ref="labelRef"
        v-model="newColumn.label"
        type="text"
        placeholder="Название"
        class="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
        @input="generateName"
        @keydown.enter="submit"
        @keydown.escape="cancel"
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
          @click="submit"
          :disabled="!newColumn.label || !newColumn.name"
          class="flex-1 px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Добавить
        </button>
        <button
          @click="cancel"
          class="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded"
        >
          ✕
        </button>
      </div>
    </div>
  </TableHead>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Plus } from 'lucide-vue-next'
import type { DirectoryColumn } from '~/types/directories'
import { TableHead } from '~/components/ui/table'
import { transliterate } from '~/utils/translit'

const props = defineProps<{
  existingColumns: DirectoryColumn[]
}>()

const emit = defineEmits<{
  (e: 'add', column: DirectoryColumn & { searchable: boolean }): void
}>()

const isAdding = ref(false)
const labelRef = ref<HTMLInputElement | null>(null)
const newColumn = ref({
  label: '',
  name: '',
  type: 'text'
})

const startAdding = () => {
  isAdding.value = true
}

watch(isAdding, (val) => {
  if (val) {
    nextTick(() => labelRef.value?.focus())
  }
})

const generateName = () => {
  newColumn.value.name = newColumn.value.label
    ? transliterate(newColumn.value.label)
    : ''
}

const submit = () => {
  if (!newColumn.value.label || !newColumn.value.name) return

  if (props.existingColumns.some(c => c.name === newColumn.value.name)) {
    alert('Столбец с таким именем уже существует')
    return
  }

  emit('add', {
    name: newColumn.value.name,
    label: newColumn.value.label,
    type: newColumn.value.type,
    required: false,
    searchable: false
  })

  cancel()
}

const cancel = () => {
  isAdding.value = false
  newColumn.value = { label: '', name: '', type: 'text' }
}
</script>
