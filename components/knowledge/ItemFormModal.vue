<template>
  <Sheet :open="isOpen" @update:open="(v) => !v && handleClose()">
    <SheetContent side="right">
      <!-- Header -->
      <SheetHeader>
        <div class="flex items-center justify-between">
          <div>
            <SheetTitle>
              {{ editItem ? 'Редактировать запись' : 'Добавить запись' }}
            </SheetTitle>
            <SheetDescription>{{ directoryName }}</SheetDescription>
          </div>
          <SheetClose />
        </div>
      </SheetHeader>

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
        <SheetFooter class-name="flex items-center gap-3">
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
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import type { DirectoryColumn, DirectoryItem } from '~/types/directories'
import { isLongTextField, getFieldPlaceholder } from '~/utils/directory-helpers'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetFooter
} from '~/components/ui/sheet'

const props = defineProps<{
  isOpen: boolean
  directoryName: string
  columns: DirectoryColumn[]
  editItem?: DirectoryItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: Record<string, any>, itemId?: string): void
}>()

const form = ref<Record<string, any>>({})
const isSubmitting = ref(false)
const error = ref('')

const isLongText = (col: DirectoryColumn) =>
  col.type === 'text' && isLongTextField(col.name)

const getPlaceholder = (col: DirectoryColumn) =>
  getFieldPlaceholder(col.name, col.label)

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
