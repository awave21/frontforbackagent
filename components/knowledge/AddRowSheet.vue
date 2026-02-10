<template>
  <Sheet :open="open" @update:open="$emit('update:open', $event)">
    <SheetContent side="right" class-name="w-full max-w-lg flex flex-col">
      <SheetHeader>
        <SheetTitle>Новая запись</SheetTitle>
        <p class="text-sm text-slate-500 mt-1">
          Заполните поля и нажмите «Сохранить». Форма останется открытой для добавления следующей записи.
        </p>
      </SheetHeader>

      <div class="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div v-for="col in columns" :key="col.name" class="space-y-1.5">
          <label class="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            {{ col.label }}
            <span v-if="col.required" class="text-red-500 text-xs">*</span>
            <span class="text-xs text-slate-400 font-mono ml-auto">{{ col.name }}</span>
          </label>

          <!-- Boolean -->
          <label
            v-if="col.type === 'bool'"
            class="flex items-center gap-3 px-3 py-2.5 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
          >
            <input
              :checked="!!formData[col.name]"
              @change="formData[col.name] = ($event.target as HTMLInputElement).checked"
              type="checkbox"
              class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-700">{{ formData[col.name] ? 'Да' : 'Нет' }}</span>
          </label>

          <!-- Long text -->
          <textarea
            v-else-if="col.type === 'text' && isLongField(col.name)"
            :ref="(el) => setRef(col.name, el)"
            v-model="formData[col.name]"
            :placeholder="getPlaceholder(col.name, col.label)"
            rows="3"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          />

          <!-- Number -->
          <input
            v-else-if="col.type === 'number'"
            :ref="(el) => setRef(col.name, el)"
            v-model.number="formData[col.name]"
            type="number"
            step="any"
            :placeholder="getPlaceholder(col.name, col.label)"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all font-mono"
          />

          <!-- Date -->
          <input
            v-else-if="col.type === 'date'"
            :ref="(el) => setRef(col.name, el)"
            v-model="formData[col.name]"
            type="date"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />

          <!-- Default text -->
          <input
            v-else
            :ref="(el) => setRef(col.name, el)"
            v-model="formData[col.name]"
            type="text"
            :placeholder="getPlaceholder(col.name, col.label)"
            class="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            @keydown.enter="handleEnter"
          />
        </div>

        <!-- Empty columns notice -->
        <div v-if="columns.length === 0" class="text-center py-8 text-slate-400 text-sm">
          Нет столбцов. Сначала добавьте столбцы в справочник.
        </div>
      </div>

      <SheetFooter>
        <div class="flex items-center gap-3 w-full">
          <button
            @click="save"
            :disabled="!hasData || saving"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
            <Check v-else class="w-4 h-4" />
            Сохранить
          </button>
          <button
            @click="close"
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Закрыть
          </button>
        </div>
        <p v-if="savedCount > 0" class="text-xs text-green-600 mt-2 text-center w-full">
          Добавлено записей за сессию: {{ savedCount }}
        </p>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { Loader2, Check } from 'lucide-vue-next'
import type { DirectoryColumn } from '~/types/directories'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '~/components/ui/sheet'
import { isLongTextField, getFieldPlaceholder } from '~/utils/directory-helpers'

const props = defineProps<{
  open: boolean
  columns: DirectoryColumn[]
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: Record<string, any>): void
}>()

const formData = ref<Record<string, any>>({})
const savedCount = ref(0)
const inputRefs = ref<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({})

const hasData = computed(() =>
  Object.values(formData.value).some(v => v !== null && v !== undefined && v !== '' && v !== false)
)

const isLongField = (name: string) => isLongTextField(name)
const getPlaceholder = (name: string, label: string) => getFieldPlaceholder(name, label)

const setRef = (name: string, el: any) => {
  inputRefs.value[name] = el as HTMLInputElement | HTMLTextAreaElement | null
}

const resetForm = () => {
  const data: Record<string, any> = {}
  props.columns.forEach(col => {
    data[col.name] = col.type === 'bool' ? false : ''
  })
  formData.value = data
}

const focusFirst = () => {
  nextTick(() => {
    const firstCol = props.columns.find(c => c.type !== 'bool')
    if (firstCol && inputRefs.value[firstCol.name]) {
      inputRefs.value[firstCol.name]?.focus()
    }
  })
}

const save = () => {
  if (!hasData.value || props.saving) return

  const cleanData: Record<string, any> = {}
  Object.entries(formData.value).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleanData[key] = value
    }
  })

  emit('save', cleanData)
  savedCount.value++
  resetForm()
  focusFirst()
}

const close = () => {
  emit('update:open', false)
}

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    e.preventDefault()
    save()
  }
}

// Initialize form when sheet opens
watch(() => props.open, (val) => {
  if (val) {
    savedCount.value = 0
    resetForm()
    focusFirst()
  }
})
</script>
