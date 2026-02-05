<template>
  <div
    class="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group"
    @click="$emit('click')"
  >
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-4 min-w-0">
        <div class="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
          <component :is="templateIcon" class="w-5 h-5 text-indigo-600" />
        </div>
        <div class="min-w-0">
          <h4 class="font-bold text-slate-900 truncate">{{ directory.name }}</h4>
          <p class="text-xs text-slate-500 mt-0.5">
            <span class="font-mono text-slate-400">{{ directory.tool_name }}</span>
            <span class="mx-1.5">•</span>
            <span>{{ directory.items_count }} {{ itemsLabel }}</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3" @click.stop>
        <button
          @click="$emit('settings')"
          class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          title="Настройки"
        >
          <Settings class="w-4 h-4" />
        </button>
        <button
          @click="handleToggle"
          class="relative w-11 h-6 rounded-full transition-colors"
          :class="[directory.is_enabled ? 'bg-emerald-500' : 'bg-slate-200']"
          :title="directory.is_enabled ? 'Выключить' : 'Включить'"
        >
          <span
            class="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
            :class="[directory.is_enabled ? 'left-6' : 'left-1']"
          ></span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  HelpCircle, 
  Tag, 
  Package, 
  Building2, 
  List,
  Settings
} from 'lucide-vue-next'

type Directory = {
  id: string
  agent_id?: string
  name: string
  slug?: string
  tool_name: string
  tool_description?: string
  template: string
  columns?: any[]
  response_mode?: string
  search_type?: string
  items_count: number
  is_enabled: boolean
  created_at?: string
  updated_at?: string
}

const props = defineProps<{
  directory: Directory
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'toggle', enabled: boolean): void
  (e: 'settings'): void
}>()

const templateIcon = computed(() => {
  const icons: Record<string, any> = {
    qa: HelpCircle,
    service_catalog: Tag,
    product_catalog: Package,
    company_info: Building2,
    custom: List
  }
  return icons[props.directory.template] || List
})

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

const handleToggle = () => {
  emit('toggle', !props.directory.is_enabled)
}
</script>
