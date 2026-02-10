<template>
  <div class="flex flex-col min-h-0">
    <button
      @click="handleToggle"
      class="w-full flex items-center justify-between p-4 hover:bg-muted/10 transition-colors shrink-0"
    >
      <h3 class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">История версий</h3>
      <ChevronDown
        class="w-4 h-4 text-muted-foreground transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>
    
    <div
      class="grid transition-all duration-300 ease-in-out"
      :class="isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
    >
      <div class="overflow-hidden">
        <div class="p-4 pt-0 space-y-3">
          <!-- Загрузка -->
          <div v-if="isLoading" class="flex justify-center py-4">
            <Loader2 class="w-4 h-4 animate-spin text-muted-foreground" />
          </div>

          <!-- Пустой список -->
          <p v-else-if="!versions.length" class="text-[11px] text-muted-foreground text-center py-2">
            История промпта пока пуста
          </p>

          <!-- Список версий -->
          <template v-else>
            <div
              v-for="version in versions"
              :key="version.id"
              class="relative pl-4 pb-3 last:pb-0 cursor-pointer group"
              :class="version.is_active ? 'border-l-2 border-primary' : 'border-l-2 border-muted'"
              @click="$emit('preview', version)"
            >
              <div
                class="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full"
                :class="version.is_active
                  ? 'bg-primary border-2 border-primary'
                  : 'bg-background border-2 border-muted-foreground/50'"
              ></div>
              <div class="flex justify-between items-start mb-0.5">
                <span class="text-xs font-medium text-foreground">{{ formatDate(version.created_at) }}</span>
                <span class="text-[10px] text-muted-foreground font-mono">v.{{ version.version_number }}</span>
              </div>
              <div class="flex items-center gap-1.5 mb-1">
                <span
                  class="text-[9px] font-semibold uppercase tracking-wider px-1 py-0.5 rounded"
                  :class="{
                    'bg-emerald-100 text-emerald-700': version.triggered_by === 'publish',
                    'bg-blue-100 text-blue-700': version.triggered_by === 'update',
                    'bg-violet-100 text-violet-700': version.triggered_by === 'manual',
                    'bg-slate-100 text-slate-600': version.triggered_by === 'create',
                  }"
                >{{ getTriggeredByLabel(version.triggered_by) }}</span>
                <span v-if="version.is_active" class="text-[9px] font-bold text-primary uppercase">Активна</span>
              </div>
              <p v-if="version.change_summary" class="text-[11px] text-muted-foreground line-clamp-2 mb-1">{{ version.change_summary }}</p>
              <p class="text-[10px] text-muted-foreground/60">{{ version.prompt_length }} симв.</p>
              <div class="flex items-center gap-3 mt-1">
                <button
                  v-if="!version.is_active"
                  @click.stop="$emit('activate', version)"
                  :disabled="isActivating"
                  class="text-[10px] font-medium text-primary hover:underline disabled:opacity-50"
                >
                  Восстановить
                </button>
                <span class="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Просмотр →
                </span>
              </div>
            </div>

            <!-- Кнопка «Загрузить ещё» -->
            <button
              v-if="hasMore"
              @click="$emit('load-more')"
              :disabled="isLoadingMore"
              class="w-full text-center text-[10px] font-medium text-primary hover:underline disabled:opacity-50 py-2"
            >
              <Loader2 v-if="isLoadingMore" class="w-3 h-3 animate-spin inline mr-1" />
              Загрузить ещё
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2, ChevronDown } from 'lucide-vue-next'
import { TRIGGERED_BY_LABELS } from '../../types/systemPromptHistory'
import type { SystemPromptVersionListItem } from '../../types/systemPromptHistory'

const props = defineProps<{
  isOpen: boolean
  versions: readonly SystemPromptVersionListItem[]
  isLoading: boolean
  isLoadingMore: boolean
  isActivating: boolean
  hasMore: boolean
}>()

const emit = defineEmits<{
  toggle: []
  preview: [version: SystemPromptVersionListItem]
  activate: [version: SystemPromptVersionListItem]
  'load-more': []
}>()

const handleToggle = () => {
  emit('toggle')
}

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
