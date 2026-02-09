<template>
  <div class="bg-background rounded-md border border-border p-4 sm:p-5 space-y-5">
    <div class="mb-6">
      <h3 class="text-lg font-bold text-slate-900">Инструменты и подключения</h3>
      <p class="text-sm text-slate-500 mt-1">
        Подключите внешние инструменты и API для расширения возможностей вашего агента.
        Мы поддерживаем различные CRM-системы и сервисы.
      </p>
    </div>

    <div class="space-y-5">
      <IntegrationCard
        title="SQNS"
        description="Интеграция с CRM для управления визитами и бронированием."
        :status="isSqnsEnabled ? (sqnsStatus?.sqnsStatus === 'error' ? 'error' : 'active') : 'inactive'"
        :status-label="sqnsStatusLabel"
        :host="sqnsHostLabel"
        :last-sync="formattedSqnsSyncAt"
        :error="sqnsErrorMessage"
        :icon="Link"
        @enable="showSqnsModal = true"
        @disable="handleSqnsDisable"
      >
        <template #extra></template>
      </IntegrationCard>

      <IntegrationCard
        title="Klientiks CRM"
        description="Эффективный инструмент для управления медицинской клиникой и медицинскими работниками."
        status="soon"
        status-label="скоро"
        :icon="Link"
      />
    </div>

    <div class="mt-10 pt-10 border-t border-slate-100">
      <div class="mb-6">
        <h3 class="text-lg font-bold text-slate-900">Пользовательские инструменты</h3>
        <p class="text-sm text-slate-500 mt-1">Подключите вебхуки или другие API инструменты.</p>
      </div>

      <div v-if="isLoadingTools" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
      </div>

      <div
        v-else-if="availableTools.length === 0"
        class="text-center py-12 bg-slate-50 rounded-md border border-dashed border-border"
      >
        <Link class="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p class="text-slate-500">Нет доступных инструментов. Создайте их в разделе "Инструменты".</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="tool in availableTools"
          :key="tool.id"
          class="p-4 border rounded-md transition-all flex items-start justify-between group"
          :class="[
            boundTools.some(bt => bt.tool_id === tool.id)
              ? 'border-indigo-100 bg-indigo-50/30'
              : 'border-slate-100 bg-white hover:border-slate-200'
          ]"
        >
          <div class="flex gap-4">
            <div class="w-9 h-9 bg-background border border-border rounded-md flex items-center justify-center">
              <component :is="tool.execution_type === 'http_webhook' ? Link : Database" class="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900 text-sm">{{ tool.name }}</h4>
              <p class="text-xs text-slate-500 mt-1 line-clamp-2">{{ tool.description || 'Нет описания' }}</p>
            </div>
          </div>

          <button
            @click="store.toggleTool(tool)"
            class="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
            :class="[
              boundTools.some(bt => bt.tool_id === tool.id)
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ boundTools.some(bt => bt.tool_id === tool.id) ? 'Подключено' : 'Подключить' }}
          </button>
        </div>
      </div>
    </div>

    <SQNSModal
      :is-open="showSqnsModal"
      :is-submitting="isSqnsSubmitting"
      @close="showSqnsModal = false"
      @submit="handleSqnsSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Database, Link, Loader2 } from 'lucide-vue-next'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'
import IntegrationCard from '~/components/IntegrationCard.vue'
import SQNSModal from '~/components/SQNSModal.vue'

const store = useAgentEditorStore()
const {
  agent,
  availableTools,
  boundTools,
  isLoadingTools,
  sqnsStatus,
  isSqnsEnabled,
  sqnsStatusLabel,
  sqnsHostLabel,
  formattedSqnsSyncAt,
  sqnsErrorMessage
} = storeToRefs(store)

const showSqnsModal = ref(false)
const isSqnsSubmitting = ref(false)

watch(agent, async (value) => {
  if (!value) return
  await store.ensureSqnsStatusLoaded()
  await store.ensureSqnsHints()
  await store.ensureToolsLoaded()
}, { immediate: true })

const handleSqnsSubmit = async (payload: { email: string; password: string }) => {
  isSqnsSubmitting.value = true
  try {
    const success = await store.enableSqnsIntegration(payload)
    if (success) {
      await store.ensureSqnsHints()
      showSqnsModal.value = false
    }
  } finally {
    isSqnsSubmitting.value = false
  }
}

const handleSqnsDisable = async () => {
  await store.disableSqnsIntegration()
}
</script>
