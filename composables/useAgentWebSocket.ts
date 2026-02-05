import { ref, watch, onUnmounted, computed, type ComputedRef, unref } from 'vue'
import { useDialogs } from './useDialogs'
import { useMessages } from './useMessages'
import type {
  WsConnectionState,
  WsOutgoingMessage,
  WsIncomingMessage,
  WsReconnectConfig
} from '../types/websocket'

const DEFAULT_RECONNECT_CONFIG: WsReconnectConfig = {
  maxAttempts: 5,
  baseDelay: 1000,
  maxDelay: 16000
}

export const useAgentWebSocket = (
  agentId: string | null | ComputedRef<string | null>,
  options?: {
    autoConnect?: boolean
    reconnectConfig?: Partial<WsReconnectConfig>
  }
) => {
  const dialogsStore = useDialogs()
  const messagesStore = useMessages()

  // Merge config with defaults
  const reconnectConfig: WsReconnectConfig = {
    ...DEFAULT_RECONNECT_CONFIG,
    ...options?.reconnectConfig
  }

  // State
  const connectionState = ref<WsConnectionState>('disconnected')
  const reconnectAttempts = ref(0)
  const currentRunId = ref<string | null>(null)
  const currentDialogId = ref<string | null>(null)

  // Internal refs
  let ws: WebSocket | null = null
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let pingTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Get WebSocket URL with token
   */
  const getWebSocketUrl = (id: string): string | null => {
    if (typeof window === 'undefined') return null

    const token = localStorage.getItem('auth_token')
    if (!token) {
      console.error('[WebSocket] No auth token found')
      return null
    }

    // Determine protocol (ws or wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host

    return `${protocol}//${host}/api/v1/agents/${id}/ws?token=${token}`
  }

  /**
   * Send message through WebSocket
   */
  const send = (message: WsOutgoingMessage): boolean => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send - connection not open')
      return false
    }

    try {
      ws.send(JSON.stringify(message))
      return true
    } catch (err) {
      console.error('[WebSocket] Send error:', err)
      return false
    }
  }

  /**
   * Handle incoming WebSocket message
   */
  const handleMessage = (event: MessageEvent) => {
    try {
      const message: WsIncomingMessage = JSON.parse(event.data)
      console.log('[WebSocket] Received:', message.type, message.data)

      switch (message.type) {
        case 'message_created': {
          // New message in dialog - add to messages store
          const msgData = message.data
          messagesStore.addIncomingMessage({
            id: msgData.id,
            dialog_id: msgData.session_id,
            role: msgData.role,
            content: msgData.content,
            created_at: msgData.created_at,
            user_info: msgData.user_info
          })
          break
        }

        case 'dialog_updated': {
          // Dialog list update
          dialogsStore.upsertDialog(message.data)
          break
        }

        case 'run_start': {
          // Agent started processing - create placeholder message
          const { run_id, dialog_id } = message.data
          currentRunId.value = run_id
          currentDialogId.value = dialog_id

          // Create streaming placeholder for agent response
          const agentMessageId = `agent-${run_id}`
          messagesStore.addMessage(dialog_id, {
            id: agentMessageId,
            dialog_id,
            role: 'agent',
            type: 'text',
            content: '',
            status: 'streaming',
            created_at: new Date().toISOString()
          })

          // Update dialog status
          dialogsStore.updateDialogStatus(dialog_id, 'IN_PROGRESS')
          break
        }

        case 'run_result': {
          // Agent completed - update message with result
          const { run_id, output, dialog_id, tokens, tools_called } = message.data
          const agentMessageId = `agent-${run_id}`

          // Update the streaming message with final content
          messagesStore.updateMessage(dialog_id, agentMessageId, {
            content: output,
            status: 'done'
          })

          // Update dialog preview
          dialogsStore.updateLastMessage(dialog_id, output.slice(0, 100), new Date().toISOString())
          dialogsStore.updateDialogStatus(dialog_id, 'NORMAL')

          // Reset run tracking
          if (currentRunId.value === run_id) {
            currentRunId.value = null
            currentDialogId.value = null
          }
          break
        }

        case 'run_error': {
          // Agent error - handle gracefully
          const { run_id, error, dialog_id } = message.data
          const agentMessageId = `agent-${run_id}`

          // Remove the failed streaming message or mark as error
          const messages = messagesStore.getMessages(dialog_id)
          const msgIndex = messages.findIndex(m => m.id === agentMessageId)
          
          if (msgIndex !== -1) {
            // Remove failed message
            messagesStore.updateMessage(dialog_id, agentMessageId, {
              content: `Ошибка: ${error}`,
              status: 'failed',
              error_message: error
            })
          }

          dialogsStore.updateDialogStatus(dialog_id, 'ERROR')

          // Reset run tracking
          if (currentRunId.value === run_id) {
            currentRunId.value = null
            currentDialogId.value = null
          }
          break
        }

        case 'ping': {
          // Respond to ping with pong
          send({ type: 'pong' })
          resetPingTimeout()
          break
        }

        case 'error': {
          console.error('[WebSocket] Server error:', message.data.message)
          break
        }

        case 'status': {
          console.log('[WebSocket] Status:', message.data)
          break
        }

        case 'dialog_joined': {
          console.log('[WebSocket] Joined dialog:', message.data.dialog_id)
          break
        }

        case 'dialog_left': {
          console.log('[WebSocket] Left dialog:', message.data.dialog_id)
          break
        }

        default: {
          console.warn('[WebSocket] Unknown message type:', (message as any).type)
        }
      }
    } catch (err) {
      console.error('[WebSocket] Error parsing message:', err)
    }
  }

  /**
   * Reset ping timeout (server sends ping every 20s)
   */
  const resetPingTimeout = () => {
    if (pingTimeout) {
      clearTimeout(pingTimeout)
    }
    // If no ping received in 60s, connection might be dead
    pingTimeout = setTimeout(() => {
      console.warn('[WebSocket] No ping received in 60s, reconnecting...')
      reconnect()
    }, 60000)
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  const scheduleReconnect = () => {
    if (reconnectAttempts.value >= reconnectConfig.maxAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached')
      connectionState.value = 'error'
      return
    }

    const delay = Math.min(
      reconnectConfig.baseDelay * Math.pow(2, reconnectAttempts.value),
      reconnectConfig.maxDelay
    )

    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value + 1}/${reconnectConfig.maxAttempts})`)

    reconnectTimeout = setTimeout(() => {
      reconnectAttempts.value++
      connect()
    }, delay)
  }

  /**
   * Connect to WebSocket
   */
  const connect = () => {
    const id = unref(agentId)
    if (!id || typeof window === 'undefined') {
      console.warn('[WebSocket] Cannot connect - no agent ID or not in browser')
      return
    }

    // Close existing connection
    disconnect(false)

    const url = getWebSocketUrl(id)
    if (!url) return

    console.log(`[WebSocket] Connecting to ${url.replace(/token=.*/, 'token=***')}`)
    connectionState.value = 'connecting'

    try {
      ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('[WebSocket] Connected')
        connectionState.value = 'connected'
        reconnectAttempts.value = 0
        resetPingTimeout()
      }

      ws.onclose = (event) => {
        console.log(`[WebSocket] Closed (code: ${event.code}, reason: ${event.reason})`)
        connectionState.value = 'disconnected'

        if (pingTimeout) {
          clearTimeout(pingTimeout)
          pingTimeout = null
        }

        // Don't reconnect if closed normally (code 1000) or unauthorized (1008)
        if (event.code !== 1000 && event.code !== 1008) {
          scheduleReconnect()
        } else if (event.code === 1008) {
          console.error('[WebSocket] Unauthorized - invalid token')
          connectionState.value = 'error'
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        connectionState.value = 'error'
      }

      ws.onmessage = handleMessage
    } catch (err) {
      console.error('[WebSocket] Connection error:', err)
      connectionState.value = 'error'
      scheduleReconnect()
    }
  }

  /**
   * Disconnect from WebSocket
   */
  const disconnect = (clearReconnect = true) => {
    if (clearReconnect && reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (pingTimeout) {
      clearTimeout(pingTimeout)
      pingTimeout = null
    }

    if (ws) {
      console.log('[WebSocket] Disconnecting')
      ws.close(1000, 'Client closed')
      ws = null
    }

    if (clearReconnect) {
      connectionState.value = 'disconnected'
      reconnectAttempts.value = 0
    }
  }

  /**
   * Force reconnect
   */
  const reconnect = () => {
    disconnect(false)
    reconnectAttempts.value = 0
    connect()
  }

  // ===========================================
  // Public API methods
  // ===========================================

  /**
   * Send a message to a dialog
   */
  const sendMessage = (dialogId: string, content: string): boolean => {
    return send({
      type: 'send_message',
      dialog_id: dialogId,
      content
    })
  }

  /**
   * Join a dialog (subscribe to updates)
   */
  const joinDialog = (dialogId: string): boolean => {
    return send({
      type: 'join_dialog',
      dialog_id: dialogId
    })
  }

  /**
   * Leave a dialog (unsubscribe)
   */
  const leaveDialog = (dialogId: string): boolean => {
    return send({
      type: 'leave_dialog',
      dialog_id: dialogId
    })
  }

  /**
   * Request connection status
   */
  const getStatus = (): boolean => {
    return send({ type: 'get_status' })
  }

  // ===========================================
  // Lifecycle
  // ===========================================

  // Auto-connect when agentId changes
  watch(
    () => unref(agentId),
    (newId, oldId) => {
      if (newId !== oldId) {
        if (newId) {
          connect()
        } else {
          disconnect()
        }
      }
    },
    { immediate: options?.autoConnect !== false }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  // Computed helpers
  const isConnected = computed(() => connectionState.value === 'connected')
  const isConnecting = computed(() => connectionState.value === 'connecting')

  return {
    // State
    connectionState,
    isConnected,
    isConnecting,
    reconnectAttempts,

    // Actions
    connect,
    disconnect,
    reconnect,
    sendMessage,
    joinDialog,
    leaveDialog,
    getStatus
  }
}
