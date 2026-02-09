<template>
  <div class="space-y-4">
    <!-- Header with Create Button -->
    <div class="flex items-center justify-between gap-4">
      <button
        @click="$emit('create')"
        class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
      >
        <Plus class="w-4 h-4" />
        Создать справочник
      </button>

      <div v-if="directories.length > 0" class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск..."
          class="pl-9 pr-4 py-2 w-48 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
    </div>

    <!-- Error State -->
    <div 
      v-else-if="error"
      class="bg-red-50 rounded-2xl border border-red-200 p-8 text-center"
    >
      <div class="max-w-md mx-auto">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle class="h-8 w-8 text-red-500" />
        </div>
        <h3 class="text-lg font-bold text-red-900">Ошибка загрузки</h3>
        <p class="text-red-600 mt-2 mb-4">{{ error }}</p>
        <p class="text-sm text-red-500 mb-4">
          Убедитесь, что API справочников реализован на бэкенде
        </p>
        <button
          @click="$emit('retry')"
          class="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
        >
          Повторить
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="directories.length === 0" 
      class="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm"
    >
      <div class="max-w-md mx-auto">
        <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen class="h-8 w-8 text-slate-400" />
        </div>
        <h3 class="text-lg font-bold text-slate-900">Справочников пока нет</h3>
        <p class="text-slate-500 mt-2 mb-6">
          Создайте справочник для хранения FAQ, каталога услуг или другой структурированной информации
        </p>
        <button
          @click="$emit('create')"
          class="px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
        >
          Создать справочник
        </button>
      </div>
    </div>

    <!-- No Results -->
    <div 
      v-else-if="filteredDirectories.length === 0" 
      class="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm"
    >
      <p class="text-slate-500">Ничего не найдено по запросу "{{ searchQuery }}"</p>
    </div>

    <!-- Directories Grid -->
    <div v-else class="grid gap-3">
      <DirectoryCard
        v-for="dir in filteredDirectories"
        :key="dir.id"
        :directory="dir"
        @click="$emit('select', dir)"
        @toggle="(enabled) => $emit('toggle', dir.id, enabled)"
        @settings="$emit('settings', dir)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, Search, Loader2, BookOpen, AlertCircle } from 'lucide-vue-next'
import DirectoryCard from './DirectoryCard.vue'
import type { Directory } from '~/types/directories'

const props = defineProps<{
  directories: Directory[]
  loading?: boolean
  error?: string | null
}>()

defineEmits<{
  (e: 'create'): void
  (e: 'select', directory: Directory): void
  (e: 'toggle', id: string, enabled: boolean): void
  (e: 'settings', directory: Directory): void
  (e: 'retry'): void
}>()

const searchQuery = ref('')

const filteredDirectories = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.directories
  }
  const query = searchQuery.value.toLowerCase()
  return props.directories.filter(dir => 
    dir.name.toLowerCase().includes(query) ||
    dir.tool_name.toLowerCase().includes(query)
  )
})
</script>
