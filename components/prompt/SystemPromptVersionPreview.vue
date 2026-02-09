<template>
  <Sheet v-model:open="isOpenModel">
    <SheetContent side="right" class="w-full sm:max-w-lg overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          Версия #{{ version?.version_number }}
        </SheetTitle>
        <SheetDescription>
          <span v-if="version">
            {{ formatDate(version.created_at) }} · {{ getTriggeredByLabel(version.triggered_by) }}
            <span v-if="version.is_active" class="ml-1 text-primary font-bold">(активна)</span>
          </span>
        </SheetDescription>
      </SheetHeader>

      <div v-if="isLoading" class="flex justify-center py-12">
        <Loader2 class="w-5 h-5 animate-spin text-muted-foreground" />
      </div>

      <template v-else-if="version">
        <p v-if="version.change_summary" class="text-sm text-muted-foreground mt-4 mb-2 italic">
          « {{ version.change_summary }} »
        </p>

        <div class="mt-4 p-3 rounded-md bg-muted/30 border border-border max-h-[60vh] overflow-y-auto">
          <pre class="text-xs text-foreground whitespace-pre-wrap font-mono leading-relaxed">{{ version.system_prompt }}</pre>
        </div>

        <div v-if="!version.is_active && canActivate" class="mt-6 flex gap-3">
          <button
            @click="$emit('activate')"
            :disabled="isActivating"
            class="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Loader2 v-if="isActivating" class="w-4 h-4 animate-spin" />
            <RotateCcw v-else class="w-4 h-4" />
            Восстановить эту версию
          </button>
        </div>
      </template>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Loader2, RotateCcw } from 'lucide-vue-next'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../ui/sheet'
import { TRIGGERED_BY_LABELS } from '../../types/systemPromptHistory'
import type { SystemPromptVersionRead } from '../../types/systemPromptHistory'

const props = defineProps<{
  open: boolean
  version: SystemPromptVersionRead | null
  isLoading: boolean
  isActivating: boolean
  canActivate?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  activate: []
}>()

const isOpenModel = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const getTriggeredByLabel = (key: string) => TRIGGERED_BY_LABELS[key] ?? key

const formatDate = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Сегодня, ${time}`
  if (isYesterday) return `Вчера, ${time}`
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }) + `, ${time}`
}
</script>
