<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Chat Header -->
    <ChatHeader
      :agent="agent"
      :dialog="currentDialog"
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
  await fetchMessages(props.agent.id, props.dialogId, { limit: 50 })
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
