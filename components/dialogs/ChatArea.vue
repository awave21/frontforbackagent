<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Chat Header -->
    <ChatHeader
      :agent="agent"
      :dialog="currentDialog"
      :is-streaming="isStreaming"
      @back="$emit('back')"
    />

    <!-- Error Banner -->
    <div
      v-if="messagesError"
      class="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center gap-2"
    >
      <span class="font-medium">Ошибка загрузки:</span>
      <span>{{ messagesError }}</span>
      <button
        @click="loadMessages"
        class="ml-auto text-red-600 hover:text-red-800 underline text-xs"
      >
        Повторить
      </button>
    </div>

    <!-- Messages Feed -->
    <MessagesFeed
      :dialog-id="dialogId"
      :messages="messages"
      :is-loading="isLoading"
      :is-streaming="isStreaming"
      :has-more="hasMore"
      @load-more="loadMoreMessages"
      @retry="handleRetry"
    />

    <!-- Composer -->
    <MessageComposer
      :is-sending="isSending"
      :is-streaming="isStreaming"
      :agent-enabled="isAgentEnabled"
      @send="handleSend"
      @attach-image="handleAttachImage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import ChatHeader from './ChatHeader.vue'
import MessagesFeed from './MessagesFeed.vue'
import MessageComposer from './MessageComposer.vue'
import { useMessages } from '../../composables/useMessages'
import { useDialogs } from '../../composables/useDialogs'
import type { Agent } from '../../composables/useAgents'

const props = defineProps<{
  dialogId: string
  agent: Agent
  wsSendMessage?: (dialogId: string, content: string) => boolean
  isWsConnected?: boolean
}>()

defineEmits<{
  (e: 'back'): void
}>()

// Composables
const {
  messagesMap,
  fetchMessages,
  sendMessage,
  sendManagerMessage,
  retryMessage,
  createOptimisticMessage,
  markMessageFailed,
  isLoading,
  isSending,
  isStreaming,
  error: messagesError,
  dialogHasMore
} = useMessages()

const { markAsRead, getDialogById } = useDialogs()

// Computed
const messages = computed(() => messagesMap[props.dialogId] ?? [])
const currentDialog = computed(() => getDialogById(props.dialogId))
const hasMore = computed(() => dialogHasMore(props.dialogId))
const isAgentEnabled = computed(() => (currentDialog.value?.agent_status ?? 'active') === 'active')

// Load messages on mount and dialog change
const loadMessages = async () => {
  console.log('[ChatArea] loadMessages for dialog:', props.dialogId, 'agent:', props.agent.id)
  await fetchMessages(props.agent.id, props.dialogId, { limit: 50 })
  console.log('[ChatArea] Messages loaded, count:', messages.value.length, 'error:', messagesError.value)
  markAsRead(props.dialogId)
}

const loadMoreMessages = async () => {
  const oldestMessage = messages.value[0]
  if (oldestMessage) {
    await fetchMessages(props.agent.id, props.dialogId, { before: oldestMessage.id, limit: 30 })
  }
}

// Handlers
const handleSend = async (content: string) => {
  // When agent is paused — send as manager message
  if (!isAgentEnabled.value) {
    await sendManagerMessage(props.agent.id, props.dialogId, content)
    return
  }

  if (props.isWsConnected && props.wsSendMessage) {
    const tempId = createOptimisticMessage(props.dialogId, content, 'text')
    const sent = props.wsSendMessage(props.dialogId, content)
    if (!sent) {
      markMessageFailed(props.dialogId, tempId, 'WebSocket отключен')
    }
  } else {
    await sendMessage(props.agent.id, props.dialogId, content, 'text', isAgentEnabled.value)
  }
}

const handleAttachImage = async (_file: File) => {
  // TODO: Implement image upload
}

const handleRetry = async (messageId: string) => {
  await retryMessage(props.agent.id, props.dialogId, messageId, isAgentEnabled.value)
}

// Watch for dialog changes
watch(() => props.dialogId, () => loadMessages(), { immediate: true })
</script>
