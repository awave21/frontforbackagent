<template>
  <div class="bg-background rounded-md border border-border p-4 sm:p-5 space-y-6">
    <!-- Auto-save indicator -->
    <div class="flex items-center justify-end mb-4">
      <span v-if="store.isAutoSaving" class="flex items-center gap-1.5 text-xs text-blue-600">
        <Loader2 class="h-3 w-3 animate-spin" />
        Сохранение...
      </span>
      <span v-else-if="store.lastAutoSavedAt" class="flex items-center gap-1.5 text-xs text-green-600">
        <Check class="h-3 w-3" />
        Сохранено
      </span>
    </div>
    
    <div class="max-w-2xl space-y-8">
      <div>
        <label class="block text-sm font-bold text-slate-900 mb-3">Название агента</label>
        <input
          v-model="form.name"
          :disabled="!canEditAgents"
          type="text"
          class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          placeholder="Введите название..."
        />
      </div>

      <div>
        <label class="block text-sm font-bold text-slate-900 mb-3">Статус агента</label>
        <div class="flex gap-4">
          <button
            type="button"
            :disabled="!canEditAgents"
            @click="form.status = 'draft'"
            class="flex-1 flex flex-col p-4 border-2 rounded-lg transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
            :class="[
              form.status === 'draft'
                ? 'border-indigo-600 bg-indigo-50/50 ring-4 ring-indigo-50'
                : 'border-slate-100 hover:border-slate-200 bg-white'
            ]"
          >
            <span class="font-bold text-slate-900">Черновик</span>
            <span class="text-xs text-slate-500 mt-1">Агент доступен только вам для тестирования</span>
          </button>
          <button
            type="button"
            :disabled="!canEditAgents"
            @click="form.status = 'published'"
            class="flex-1 flex flex-col p-4 border-2 rounded-lg transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
            :class="[
              form.status === 'published'
                ? 'border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-50'
                : 'border-slate-100 hover:border-slate-200 bg-white'
            ]"
          >
            <span class="font-bold text-slate-900">Опубликован</span>
            <span class="text-xs text-slate-500 mt-1">Агент доступен всем сотрудникам клиники</span>
          </button>
        </div>
      </div>

      <div v-if="canEditAgents" class="pt-8 border-t border-red-50">
        <h4 class="text-sm font-bold text-red-600 mb-2">Опасная зона</h4>
        <p class="text-xs text-slate-500 mb-4">Удаление агента приведет к безвозвратной потере всех его настроек и истории.</p>
        <button
          type="button"
          @click="handleDelete"
          class="px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-md text-sm font-bold hover:bg-red-50 transition-colors"
        >
          Удалить агента
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { navigateTo } from '#app'
import { Check, Loader2 } from 'lucide-vue-next'
import { usePermissions } from '~/composables/usePermissions'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'

const store = useAgentEditorStore()
const { form } = storeToRefs(store)
const { canEditAgents } = usePermissions()

const handleDelete = async () => {
  if (!confirm('Вы уверены, что хотите удалить этого агента? Это действие нельзя отменить.')) return
  const success = await store.removeAgent()
  if (success) {
    navigateTo('/agents')
  }
}
</script>
