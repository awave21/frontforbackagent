<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Chat Header -->
    <ChatHeader
      :agent="agent"
      :is-streaming="isStreaming"
      @back="$emit('back')"
    />

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
import { computed, watch, onMounted } from 'vue'
import ChatHeader from './ChatHeader.vue'
import MessagesFeed from './MessagesFeed.vue'
import MessageComposer from './MessageComposer.vue'
import { useMessages } from '../../composables/useMessages'
import { useAgentEnabled } from '../../composables/useAgentEnabled'
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
  retryMessage,
  createOptimisticMessage,
  markMessageFailed,
  isLoading,
  isSending,
  isStreaming,
  dialogHasMore
} = useMessages()

const { isAgentEnabled: checkAgentEnabled } = useAgentEnabled()
const { markAsRead } = useDialogs()

// Computed - use messagesMap.value directly for proper reactivity
const messages = computed(() => {
  // Access messagesMap.value first to create dependency on the entire object
  const allMessages = messagesMap.value
  const msgs = allMessages[props.dialogId] || []
  console.log(`[ChatArea] computed messages for ${props.dialogId}:`, msgs.length)
  return msgs
})
const hasMore = computed(() => dialogHasMore(props.dialogId))
const isAgentEnabled = computed(() => checkAgentEnabled(props.agent.id))

// Load messages on mount and dialog change
const loadMessages = async () => {
  console.log('[ChatArea] Loading messages for:', { agentId: props.agent.id, dialogId: props.dialogId })
  await fetchMessages(props.agent.id, props.dialogId, { limit: 50 })
  console.log('[ChatArea] Messages loaded:', messages.value.length)
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
  // Use WebSocket if connected, otherwise fall back to HTTP
  if (props.isWsConnected && props.wsSendMessage) {
    console.log('[ChatArea] Sending via WebSocket')
    
    // Create optimistic message first
    const tempId = createOptimisticMessage(props.dialogId, content, 'text')
    
    // Send via WebSocket
    const sent = props.wsSendMessage(props.dialogId, content)
    
    if (!sent) {
      console.warn('[ChatArea] WebSocket send failed, message marked as failed')
      markMessageFailed(props.dialogId, tempId, 'WebSocket отключен')
    }
    // Note: WebSocket events (run_start, run_result, etc.) will handle the rest
  } else {
    console.log('[ChatArea] Sending via HTTP (WebSocket not connected)')
    // HTTP fallback - uses existing SSE streaming
    await sendMessage(props.agent.id, props.dialogId, content, 'text', isAgentEnabled.value)
  }
}

const handleAttachImage = async (file: File) => {
  // TODO: Implement image upload
  console.log('Attach image:', file.name)
}

const handleRetry = async (messageId: string) => {
  await retryMessage(props.agent.id, props.dialogId, messageId, isAgentEnabled.value)
}

// Watch for dialog changes
watch(() => props.dialogId, () => {
  loadMessages()
}, { immediate: true })

onMounted(() => {
  loadMessages()
})
</script>
