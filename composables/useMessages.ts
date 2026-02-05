import { ref, readonly } from 'vue'
import type { Message, MessageRole, MessageStatus, MessageType, MessagesListResponse, SendMessageData } from '../types/dialogs'
import { useApiFetch } from './useApiFetch'
import { useDialogs } from './useDialogs'

// State per dialog - using ref with plain object for reliable reactivity
const messagesMap = ref<Record<string, Message[]>>({})

// Helper to update messages - creates new reference to trigger reactivity
const setMessages = (dialogId: string, messages: Message[]) => {
  messagesMap.value = { ...messagesMap.value, [dialogId]: messages }
}
const isLoading = ref(false)
const isSending = ref(false)
const isStreaming = ref(false)
const streamingMessageId = ref<string | null>(null)
const error = ref<string | null>(null)
const hasMore = ref<Map<string, boolean>>(new Map())

const normalizeRole = (
  rawRole: unknown,
  flags: { isUser?: boolean; is_user?: boolean; isAgent?: boolean; is_agent?: boolean }
): MessageRole => {
  const isUserFlag = flags.isUser ?? flags.is_user
  const isAgentFlag = flags.isAgent ?? flags.is_agent

  if (typeof isUserFlag === 'boolean') return isUserFlag ? 'user' : 'agent'
  if (typeof isAgentFlag === 'boolean') return isAgentFlag ? 'agent' : 'user'

  if (typeof rawRole === 'string') {
    const value = rawRole.toLowerCase()
    if (['user', 'human', 'client', 'customer', 'visitor', 'requester'].includes(value)) return 'user'
    if (['agent', 'assistant', 'bot', 'ai', 'system'].includes(value)) return 'agent'
  }

  return 'agent'
}

const normalizeType = (rawType: unknown): MessageType => {
  if (typeof rawType === 'string') {
    const value = rawType.toLowerCase()
    if (value.includes('image') || value.includes('photo') || value.includes('img')) return 'image'
    if (value.includes('voice') || value.includes('audio') || value.includes('wav') || value.includes('mp3')) return 'voice'
  }

  return 'text'
}

const normalizeStatus = (rawStatus: unknown): MessageStatus => {
  if (typeof rawStatus !== 'string') return 'sent'
  const value = rawStatus.toLowerCase()
  if (value === 'sending') return 'sending'
  if (value === 'failed') return 'failed'
  if (value === 'streaming') return 'streaming'
  if (value === 'done') return 'done'
  return 'sent'
}

const normalizeMessage = (raw: any, fallbackDialogId: string): Message => {
  const dialogId = raw?.dialog_id ?? raw?.dialogId ?? raw?.session_id ?? raw?.sessionId ?? fallbackDialogId
  const id = raw?.id ?? raw?.message_id ?? raw?.messageId ?? raw?.uuid ?? raw?._id ?? `${dialogId}-${raw?.created_at ?? raw?.createdAt ?? Date.now()}`
  const rawRoleValue = raw?.role ?? raw?.sender ?? raw?.author ?? raw?.from ?? raw?.actor ?? raw?.direction
  const role = normalizeRole(rawRoleValue, {
    isUser: raw?.isUser,
    is_user: raw?.is_user,
    isAgent: raw?.isAgent,
    is_agent: raw?.is_agent
  })
  const type = normalizeType(raw?.type ?? raw?.message_type ?? raw?.content_type ?? raw?.kind ?? raw?.media_type)
  const contentValue = raw?.content ?? raw?.text ?? raw?.message ?? raw?.body ?? raw?.payload ?? raw?.data?.content ?? ''
  const content = typeof contentValue === 'string' ? contentValue : JSON.stringify(contentValue)
  const createdAt = raw?.created_at ?? raw?.createdAt ?? raw?.timestamp ?? raw?.time ?? raw?.created ?? new Date().toISOString()
  const status = normalizeStatus(raw?.status)
  const durationSeconds = raw?.duration_seconds ?? raw?.durationSeconds ?? raw?.duration
  const durationValue = typeof durationSeconds === 'number'
    ? durationSeconds
    : Number.isFinite(Number(durationSeconds))
      ? Number(durationSeconds)
      : undefined

  return {
    id: String(id),
    dialog_id: String(dialogId),
    role,
    type,
    content: String(content),
    status,
    duration_seconds: durationValue,
    created_at: String(createdAt)
  }
}

export const useMessages = () => {
  const apiFetch = useApiFetch()
  const { updateDialogStatus, updateLastMessage, incrementUnread } = useDialogs()

  /**
   * Get messages for a dialog
   */
  const getMessages = (dialogId: string): Message[] => {
    const msgs = messagesMap.value[dialogId] || []
    console.log(`[useMessages] getMessages(${dialogId}):`, msgs.length, 'messages')
    return msgs
  }

  /**
   * Fetch messages for a dialog (with pagination for infinite scroll)
   */
  const fetchMessages = async (agentId: string, dialogId: string, options?: { before?: string; limit?: number }) => {
    if (!agentId || !dialogId) {
      console.warn('[useMessages] Missing agentId or dialogId:', { agentId, dialogId })
      return
    }

    isLoading.value = true
    error.value = null
    let responseHasMore = false

    try {
      const params = new URLSearchParams()
      if (options?.before) params.set('before', options.before)
      if (options?.limit) params.set('limit', String(options.limit))
      
      const queryString = params.toString()
      // URL-encode dialogId to handle special characters like ':'
      const encodedDialogId = encodeURIComponent(dialogId)
      const url = `agents/${agentId}/dialogs/${encodedDialogId}/messages${queryString ? `?${queryString}` : ''}`

      console.log(`[useMessages] Fetching history from: ${url}`)
      console.log(`[useMessages] Original dialogId: ${dialogId}, encoded: ${encodedDialogId}`)

      const response = await apiFetch<MessagesListResponse | Message[]>(url, {
        method: 'GET'
      })
      
      console.log(`[useMessages] Raw response:`, response)
      console.log(`[useMessages] Response type:`, Array.isArray(response) ? 'array' : typeof response)
      
      // Handle both response formats: {messages: [...], has_more: bool} or direct array [...]
      let messagesList: Message[] = []
      
      if (Array.isArray(response)) {
        messagesList = response
        responseHasMore = false // If array, assume no pagination info
      } else if (response && typeof response === 'object' && 'messages' in response) {
        messagesList = response.messages || []
        responseHasMore = response.has_more || false
      } else if (response && typeof response === 'object' && 'items' in response) {
        messagesList = (response as any).items || []
        responseHasMore = (response as any).has_more || false
      } else if (response && typeof response === 'object' && 'data' in response) {
        messagesList = (response as any).data || []
        responseHasMore = (response as any).has_more || false
      } else {
        console.error('[useMessages] Unexpected response format:', response)
      }

      const normalizedMessages = messagesList.map(message => normalizeMessage(message, dialogId))
      messagesList = normalizedMessages
      
      console.log(`[useMessages] Received ${messagesList.length} messages`, {
        hasMore: responseHasMore,
        dialogId
      })
      
      const existingMessages = messagesMap.value[dialogId] || []
      
      if (options?.before) {
        // Prepend older messages (infinite scroll up)
        setMessages(dialogId, [...messagesList, ...existingMessages])
      } else {
        // Initial load
        setMessages(dialogId, messagesList)
      }
      
      console.log(`[useMessages] Messages set for ${dialogId}:`, messagesMap.value[dialogId]?.length)
      
      hasMore.value.set(dialogId, responseHasMore)
    } catch (err: any) {
      const msg = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Не удалось загрузить сообщения'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send a message (text, image, voice)
   */
  const sendMessage = async (
    agentId: string,
    dialogId: string,
    content: string,
    type: MessageType = 'text',
    agentEnabled: boolean = true
  ): Promise<Message | null> => {
    if (!agentId || !dialogId || !content.trim()) return null

    isSending.value = true
    error.value = null

    // Create optimistic message
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      dialog_id: dialogId,
      role: 'user',
      type,
      content: content.trim(),
      status: 'sending',
      created_at: new Date().toISOString()
    }

    // Add to messages immediately
    const messages = messagesMap.value[dialogId] || []
    setMessages(dialogId, [...messages, optimisticMessage])

    try {
      const body: SendMessageData = { content: content.trim(), type }
      
      const response = await apiFetch<Message>(`agents/${agentId}/dialogs/${dialogId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })

      // Replace optimistic message with real one
      const currentMessages = messagesMap.value[dialogId] || []
      const index = currentMessages.findIndex(m => m.id === tempId)
      if (index !== -1) {
        const updatedMessages = [...currentMessages]
        updatedMessages[index] = { ...response, status: 'sent' }
        setMessages(dialogId, updatedMessages)
      }

      // Update dialog preview
      updateLastMessage(dialogId, content.trim().slice(0, 100), response.created_at)

      // If agent is enabled, start streaming response
      if (agentEnabled) {
        await startAgentStream(agentId, dialogId, response.id)
      }

      return response
    } catch (err: any) {
      // Mark message as failed
      const currentMessages = messagesMap.value[dialogId] || []
      const index = currentMessages.findIndex(m => m.id === tempId)
      if (index !== -1) {
        const updatedMessages = [...currentMessages]
        updatedMessages[index] = { 
          ...updatedMessages[index], 
          status: 'failed',
          error_message: err?.message || 'Ошибка отправки'
        }
        setMessages(dialogId, updatedMessages)
      }

      const msg = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Не удалось отправить сообщение'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
      return null
    } finally {
      isSending.value = false
    }
  }

  /**
   * Retry failed message
   */
  const retryMessage = async (agentId: string, dialogId: string, messageId: string, agentEnabled: boolean = true) => {
    const messages = messagesMap.value[dialogId] || []
    const message = messages.find(m => m.id === messageId)
    
    if (!message || message.status !== 'failed') return

    // Remove failed message
    setMessages(dialogId, messages.filter(m => m.id !== messageId))

    // Resend
    await sendMessage(agentId, dialogId, message.content, message.type, agentEnabled)
  }

  // ===========================================
  // WebSocket-specific methods
  // ===========================================

  /**
   * Create optimistic user message (for WebSocket mode)
   * Returns the temp ID for tracking
   */
  const createOptimisticMessage = (
    dialogId: string,
    content: string,
    type: MessageType = 'text'
  ): string => {
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      dialog_id: dialogId,
      role: 'user',
      type,
      content: content.trim(),
      status: 'sending',
      created_at: new Date().toISOString()
    }

    const messages = messagesMap.value[dialogId] || []
    setMessages(dialogId, [...messages, optimisticMessage])
    isSending.value = true

    return tempId
  }

  /**
   * Mark optimistic message as sent (when server confirms via WebSocket)
   */
  const markMessageSent = (dialogId: string, tempId: string, realId?: string) => {
    const messages = messagesMap.value[dialogId] || []
    const index = messages.findIndex(m => m.id === tempId)
    
    if (index !== -1) {
      const updatedMessages = [...messages]
      updatedMessages[index] = {
        ...updatedMessages[index],
        id: realId || tempId,
        status: 'sent'
      }
      setMessages(dialogId, updatedMessages)
    }
    
    isSending.value = false
  }

  /**
   * Mark optimistic message as failed
   */
  const markMessageFailed = (dialogId: string, tempId: string, errorMessage?: string) => {
    const messages = messagesMap.value[dialogId] || []
    const index = messages.findIndex(m => m.id === tempId)
    
    if (index !== -1) {
      const updatedMessages = [...messages]
      updatedMessages[index] = {
        ...updatedMessages[index],
        status: 'failed',
        error_message: errorMessage || 'Ошибка отправки'
      }
      setMessages(dialogId, updatedMessages)
    }
    
    isSending.value = false
    error.value = errorMessage || 'Ошибка отправки'
  }

  /**
   * Handle run_start event from WebSocket
   * Creates streaming placeholder for agent response
   */
  const handleRunStart = (runId: string, dialogId: string) => {
    isStreaming.value = true
    const agentMessageId = `agent-${runId}`
    streamingMessageId.value = agentMessageId

    const agentMessage: Message = {
      id: agentMessageId,
      dialog_id: dialogId,
      role: 'agent',
      type: 'text',
      content: '',
      status: 'streaming',
      created_at: new Date().toISOString()
    }

    const messages = messagesMap.value[dialogId] || []
    setMessages(dialogId, [...messages, agentMessage])
  }

  /**
   * Handle run_result event from WebSocket
   * Updates agent message with final content
   */
  const handleRunResult = (runId: string, dialogId: string, output: string) => {
    const agentMessageId = `agent-${runId}`
    
    const messages = messagesMap.value[dialogId] || []
    const index = messages.findIndex(m => m.id === agentMessageId)
    
    if (index !== -1) {
      const updatedMessages = [...messages]
      updatedMessages[index] = {
        ...updatedMessages[index],
        content: output,
        status: 'done'
      }
      setMessages(dialogId, updatedMessages)
    }

    isStreaming.value = false
    streamingMessageId.value = null
  }

  /**
   * Handle run_error event from WebSocket
   */
  const handleRunError = (runId: string, dialogId: string, errorMsg: string) => {
    const agentMessageId = `agent-${runId}`
    
    const messages = messagesMap.value[dialogId] || []
    const index = messages.findIndex(m => m.id === agentMessageId)
    
    if (index !== -1) {
      const updatedMessages = [...messages]
      updatedMessages[index] = {
        ...updatedMessages[index],
        content: `Ошибка: ${errorMsg}`,
        status: 'failed',
        error_message: errorMsg
      }
      setMessages(dialogId, updatedMessages)
    }

    isStreaming.value = false
    streamingMessageId.value = null
    error.value = errorMsg
  }

  /**
   * @deprecated Use WebSocket for streaming instead
   * Start SSE stream for agent response (HTTP fallback)
   */
  const startAgentStream = async (agentId: string, dialogId: string, userMessageId: string) => {
    isStreaming.value = true
    updateDialogStatus(dialogId, 'IN_PROGRESS')

    // Create placeholder for agent message
    const agentMessageId = `agent-${Date.now()}`
    streamingMessageId.value = agentMessageId
    
    const agentMessage: Message = {
      id: agentMessageId,
      dialog_id: dialogId,
      role: 'agent',
      type: 'text',
      content: '',
      status: 'streaming',
      created_at: new Date().toISOString()
    }

    const messages = messagesMap.value[dialogId] || []
    setMessages(dialogId, [...messages, agentMessage])

    try {
      // Get auth token
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      const response = await fetch(`/api/v1/agents/${agentId}/dialogs/${dialogId}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ user_message_id: userMessageId })
      })

      if (!response.ok) {
        throw new Error(`Stream error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const event = JSON.parse(data)
              
              if (event.type === 'delta' && event.data?.content) {
                // Update streaming message content
                const currentMessages = messagesMap.value[dialogId] || []
                const index = currentMessages.findIndex(m => m.id === agentMessageId)
                if (index !== -1) {
                  const updatedMessages = [...currentMessages]
                  updatedMessages[index] = {
                    ...updatedMessages[index],
                    content: updatedMessages[index].content + event.data.content
                  }
                  setMessages(dialogId, updatedMessages)
                }
              } else if (event.type === 'done') {
                // Mark as complete
                const currentMessages = messagesMap.value[dialogId] || []
                const index = currentMessages.findIndex(m => m.id === agentMessageId)
                if (index !== -1) {
                  const updatedMessages = [...currentMessages]
                  updatedMessages[index] = {
                    ...updatedMessages[index],
                    id: event.data?.message_id || agentMessageId,
                    status: 'done'
                  }
                  setMessages(dialogId, updatedMessages)
                }
              } else if (event.type === 'error') {
                throw new Error(event.data?.error || 'Stream error')
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE event:', parseError)
            }
          }
        }
      }

      // Finalize streaming
      const finalMessages = messagesMap.value[dialogId] || []
      const finalIndex = finalMessages.findIndex(m => m.id === agentMessageId || m.status === 'streaming')
      if (finalIndex !== -1 && finalMessages[finalIndex].status === 'streaming') {
        const updatedFinalMessages = [...finalMessages]
        updatedFinalMessages[finalIndex] = { ...updatedFinalMessages[finalIndex], status: 'done' }
        setMessages(dialogId, updatedFinalMessages)
      }

      // Update dialog preview with agent response
      const agentContent = finalMessages[finalIndex]?.content || ''
      if (agentContent) {
        updateLastMessage(dialogId, agentContent.slice(0, 100), new Date().toISOString())
      }

      updateDialogStatus(dialogId, 'NORMAL')
    } catch (err: any) {
      console.error('Stream error:', err)
      
      // Mark agent message as failed/remove it
      const currentMessages = messagesMap.value[dialogId] || []
      const index = currentMessages.findIndex(m => m.id === agentMessageId)
      if (index !== -1) {
        // Remove the failed streaming message
        const updatedMessages = currentMessages.filter((_, i) => i !== index)
        setMessages(dialogId, updatedMessages)
      }

      updateDialogStatus(dialogId, 'ERROR')
      error.value = err?.message || 'Ошибка получения ответа агента'
    } finally {
      isStreaming.value = false
      streamingMessageId.value = null
    }
  }

  /**
   * Add message locally (for real-time updates)
   */
  const addMessage = (dialogId: string, message: Message) => {
    const messages = messagesMap.value[dialogId] || []
    setMessages(dialogId, [...messages, message])
  }

  /**
   * Update message locally
   */
  const updateMessage = (dialogId: string, messageId: string, updates: Partial<Message>) => {
    const messages = messagesMap.value[dialogId] || []
    const index = messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      const updatedMessages = [...messages]
      updatedMessages[index] = { ...updatedMessages[index], ...updates }
      setMessages(dialogId, updatedMessages)
    }
  }

  /**
   * Clear messages for a dialog
   */
  const clearMessages = (dialogId: string) => {
    const { [dialogId]: _, ...rest } = messagesMap.value
    messagesMap.value = rest
    hasMore.value.delete(dialogId)
  }

  /**
   * Check if dialog has more messages to load
   */
  const dialogHasMore = (dialogId: string): boolean => {
    return hasMore.value.get(dialogId) ?? true
  }

  /**
   * Add incoming message from SSE (for real-time updates)
   */
  const addIncomingMessage = (message: any) => {
    const dialogId = message?.dialog_id ?? message?.dialogId ?? message?.session_id ?? message?.sessionId
    if (!dialogId) return

    const currentMessages = messagesMap.value[dialogId] || []
    const normalizedMessage = normalizeMessage(message, dialogId)
    
    // Check if message already exists to avoid duplicates
    if (!currentMessages.find(m => m.id === normalizedMessage.id)) {
      setMessages(dialogId, [...currentMessages, normalizedMessage])
      
      // Update dialog preview in the list
      updateLastMessage(dialogId, normalizedMessage.content.slice(0, 100), normalizedMessage.created_at)
    }
  }

  return {
    // State
    isLoading: readonly(isLoading),
    isSending: readonly(isSending),
    isStreaming: readonly(isStreaming),
    streamingMessageId: readonly(streamingMessageId),
    error: readonly(error),
    messagesMap, // Export for direct reactive access

    // Getters
    getMessages,
    dialogHasMore,

    // Actions
    fetchMessages,
    sendMessage,
    retryMessage,
    addMessage,
    addIncomingMessage,
    updateMessage,
    clearMessages,

    // WebSocket-specific methods
    createOptimisticMessage,
    markMessageSent,
    markMessageFailed,
    handleRunStart,
    handleRunResult,
    handleRunError,

    // @deprecated - use WebSocket streaming instead
    startAgentStream
  }
}
