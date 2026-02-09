<template>
  <div class="bg-background rounded-md border border-border p-4 sm:p-5 space-y-5">
    <div class="mb-6">
      <h3 class="text-lg font-bold text-slate-900">Каналы связи</h3>
      <p class="text-sm text-slate-500 mt-1">
        Подключите мессенджеры и другие каналы для общения с вашими клиентами через агента.
      </p>
    </div>

    <div v-if="isLoadingChannels" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-indigo-600" />
    </div>

    <div v-else class="space-y-5">
      <div
        class="p-4 border rounded-lg transition-all"
        :class="[
          telegramChannel
            ? 'border-indigo-100 bg-indigo-50/30'
            : 'border-slate-100 bg-white hover:border-slate-200'
        ]"
      >
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-md flex items-center justify-center">
              <Send class="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900">Telegram Bot</h4>
              <p class="text-sm text-slate-500 mt-1">
                Подключите Telegram-бота для автоматического общения с клиентами.
              </p>
              <div v-if="telegramChannel" class="mt-3">
                <span
                  class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                  :class="telegramChannel.webhook_enabled ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ telegramChannel.webhook_enabled ? 'Активен' : 'Неактивен' }}
                </span>
              </div>
            </div>
          </div>

          <button
            v-if="canEditAgents && telegramChannel"
            @click="showChannelEditSheet = true"
            class="px-4 py-2 rounded-md text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Настроить
          </button>
          <button
            v-else-if="canEditAgents"
            @click="showChannelEditSheet = true"
            class="px-4 py-2 rounded-md text-sm font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Подключить
          </button>
        </div>
      </div>

      <div class="p-4 border border-slate-100 rounded-lg bg-slate-50/50 opacity-60">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-md flex items-center justify-center">
              <MessageSquare class="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900">WhatsApp</h4>
              <p class="text-sm text-slate-500 mt-1">
                Интеграция с WhatsApp Business API для общения с клиентами.
              </p>
            </div>
          </div>
          <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 uppercase">
            Скоро
          </span>
        </div>
      </div>

      <div class="p-4 border border-slate-100 rounded-lg bg-slate-50/50 opacity-60">
        <div class="flex items-start justify-between">
          <div class="flex gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-md flex items-center justify-center">
              <MessageSquare class="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 class="font-bold text-slate-900">Виджет на сайт</h4>
              <p class="text-sm text-slate-500 mt-1">
                Встраиваемый чат-виджет для вашего сайта.
              </p>
            </div>
          </div>
          <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 uppercase">
            Скоро
          </span>
        </div>
      </div>
    </div>

    <ChannelEditSheet
      v-if="agent"
      :open="showChannelEditSheet"
      :agent-id="agent.id"
      :current-token="telegramChannel?.bot_token"
      @update:open="showChannelEditSheet = $event"
      @saved="handleChannelSaved"
      @deleted="handleChannelDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { Loader2, MessageSquare, Send } from 'lucide-vue-next'
import { useAgentEditorStore } from '~/composables/useAgentEditorStore'
import { usePermissions } from '~/composables/usePermissions'
import { useToast } from '~/composables/useToast'
import ChannelEditSheet from '~/components/ChannelEditSheet.vue'

const store = useAgentEditorStore()
const { agent, telegramChannel, isLoadingChannels } = storeToRefs(store)
const { canEditAgents } = usePermissions()
const { success: toastSuccess } = useToast()

const showChannelEditSheet = ref(false)

watch(agent, (value) => {
  if (value) {
    store.ensureChannelsLoaded()
  }
}, { immediate: true })

const handleChannelSaved = async () => {
  await store.fetchChannels()
  showChannelEditSheet.value = false
  toastSuccess('Канал обновлён', 'Настройки Telegram успешно сохранены')
}

const handleChannelDeleted = async () => {
  await store.fetchChannels()
  showChannelEditSheet.value = false
  toastSuccess('Канал удалён', 'Подключение Telegram отключено')
}
</script>
