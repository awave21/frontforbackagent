// Dialog statuses for indicators
export type DialogStatus = 'NEW' | 'IN_PROGRESS' | 'UNREAD' | 'ERROR' | 'NORMAL'

// Dialog entity
export type Dialog = {
  id: string
  agent_id: string
  title: string | null              // null = auto-label from first message
  last_message_preview: string | null
  last_message_at: string | null
  unread_count: number
  is_pinned: boolean
  is_archived: boolean
  status: DialogStatus
  created_at: string
  updated_at?: string
}

// Message types
export type MessageRole = 'user' | 'agent'
export type MessageType = 'text' | 'image' | 'voice'
export type MessageStatus = 'sending' | 'sent' | 'failed' | 'streaming' | 'done'

// Message entity
export type Message = {
  id: string
  dialog_id: string
  role: MessageRole
  type: MessageType
  content: string                   // text content or URL for images/voice
  status: MessageStatus
  duration_seconds?: number         // for voice messages
  created_at: string
  error_message?: string            // for failed messages
}

// API request/response types
export type CreateDialogData = {
  title?: string
}

export type UpdateDialogData = {
  title?: string
  is_pinned?: boolean
  is_archived?: boolean
}

export type SendMessageData = {
  content: string
  type: MessageType
}

export type DialogsListResponse = {
  dialogs: Dialog[]
  total: number
  has_more: boolean
}

export type MessagesListResponse = {
  messages: Message[]
  has_more: boolean
  next_cursor?: string
}

// SSE streaming event types
export type StreamEventType = 'start' | 'delta' | 'done' | 'error'

export type StreamEvent = {
  type: StreamEventType
  data: {
    message_id?: string
    content?: string
    error?: string
  }
}
