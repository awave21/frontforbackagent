import { ref } from 'vue'
import type { Dialog, DialogAgentStatus, CreateDialogData, UpdateDialogData, DialogsListResponse } from '../types/dialogs'
import { useApiFetch } from './useApiFetch'
import { getReadableErrorMessage } from '~/utils/api-errors'

const AGENT_STATUSES = new Set<string>(['active', 'paused'])

/**
 * Normalize a raw dialog from the API:
 * backend returns agent toggle as `status: "active"|"paused"`,
 * but frontend uses `status` for UI indicators (IN_PROGRESS, etc.)
 * so we move it to `agent_status` and reset `status` to 'NORMAL'.
 */
const normalizeDialog = (raw: any): Dialog => {
  const agentStatus: DialogAgentStatus =
    raw.status && AGENT_STATUSES.has(raw.status) ? raw.status : (raw.agent_status ?? 'active')

  return {
    ...raw,
    agent_status: agentStatus,
    // If backend returned 'active'/'paused' as status, reset to NORMAL for UI indicators
    status: AGENT_STATUSES.has(raw.status) ? 'NORMAL' : (raw.status || 'NORMAL')
  }
}

// Shared state across components - using ref for deep reactivity
const dialogs = ref<Dialog[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const currentAgentId = ref<string | null>(null)

export const useDialogs = () => {
  const apiFetch = useApiFetch()

  /**
   * Fetch dialogs for a specific agent
   */
  const fetchDialogs = async (agentId: string, options?: { archived?: boolean }) => {
    if (!agentId) {
      console.warn('[useDialogs] fetchDialogs called without agentId')
      return
    }

    isLoading.value = true
    error.value = null
    currentAgentId.value = agentId

    try {
      const params = new URLSearchParams()
      if (options?.archived !== undefined) {
        params.set('archived', String(options.archived))
      }

      const queryString = params.toString()
      const url = `agents/${agentId}/dialogs${queryString ? `?${queryString}` : ''}`

      const response = await apiFetch<DialogsListResponse | Dialog[]>(url)
      
      // Handle both response formats: {dialogs: [...]} or direct array [...]
      let dialogsList: Dialog[] = []
      if (Array.isArray(response)) {
        dialogsList = response
      } else if (response && typeof response === 'object' && 'dialogs' in response) {
        dialogsList = response.dialogs || []
      } else if (response && typeof response === 'object' && 'items' in response) {
        // Some APIs use 'items' instead of 'dialogs'
        dialogsList = (response as any).items || []
      }
      
      dialogs.value = dialogsList.map(normalizeDialog)
    } catch (err: any) {
      console.error('[useDialogs] Error fetching dialogs:', err)
      console.error('[useDialogs] Error details:', {
        status: err?.statusCode || err?.status,
        data: err?.data,
        message: err?.message
      })
      error.value = getReadableErrorMessage(err, 'Не удалось загрузить диалоги')
      dialogs.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new dialog for the current agent
   */
  const createDialog = async (agentId: string, data?: CreateDialogData): Promise<Dialog | null> => {
    if (!agentId) return null

    isLoading.value = true
    error.value = null

    try {
      const response = await apiFetch<Dialog>(`agents/${agentId}/dialogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data || {}
      })

      const normalized = normalizeDialog(response)
      // Add to the beginning of the list
      dialogs.value = [normalized, ...dialogs.value]
      return normalized
    } catch (err: any) {
      error.value = getReadableErrorMessage(err, 'Не удалось создать диалог')
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a dialog (rename, pin, archive)
   */
  const updateDialog = async (agentId: string, dialogId: string, data: UpdateDialogData): Promise<Dialog | null> => {
    if (!agentId || !dialogId) return null

    try {
      const response = await apiFetch<Dialog>(`agents/${agentId}/dialogs/${encodeURIComponent(dialogId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: data
      })

      const normalized = normalizeDialog(response)
      // Update in local state
      const index = dialogs.value.findIndex(d => d.id === dialogId)
      if (index !== -1) {
        dialogs.value[index] = normalized
      }

      return normalized
    } catch (err: any) {
      error.value = getReadableErrorMessage(err, 'Не удалось обновить диалог')
      return null
    }
  }

  /**
   * Delete a dialog
   */
  const deleteDialog = async (agentId: string, dialogId: string): Promise<boolean> => {
    if (!agentId || !dialogId) return false

    try {
      await apiFetch(`agents/${agentId}/dialogs/${encodeURIComponent(dialogId)}`, {
        method: 'DELETE'
      })

      // Remove from local state
      dialogs.value = dialogs.value.filter(d => d.id !== dialogId)
      return true
    } catch (err: any) {
      error.value = getReadableErrorMessage(err, 'Не удалось удалить диалог')
      return false
    }
  }

  /**
   * Toggle per-dialog agent status (active <-> paused) via API
   * PATCH /agents/{agent_id}/dialogs/{dialog_id}/status  { status: "paused"|"active" }
   */
  const toggleDialogAgentStatus = async (
    agentId: string,
    dialogId: string
  ): Promise<DialogAgentStatus | null> => {
    if (!agentId || !dialogId) return null

    const idx = dialogs.value.findIndex(d => d.id === dialogId)
    const currentStatus: DialogAgentStatus = idx !== -1
      ? (dialogs.value[idx].agent_status ?? 'active')
      : 'active'
    const newStatus: DialogAgentStatus = currentStatus === 'active' ? 'paused' : 'active'

    // Optimistic update
    if (idx !== -1) {
      dialogs.value[idx] = { ...dialogs.value[idx], agent_status: newStatus }
    }

    try {
      await apiFetch(
        `agents/${agentId}/dialogs/${encodeURIComponent(dialogId)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: { status: newStatus }
        }
      )
      return newStatus
    } catch (err: any) {
      // Rollback on failure
      if (idx !== -1) {
        dialogs.value[idx] = { ...dialogs.value[idx], agent_status: currentStatus }
      }
      error.value = getReadableErrorMessage(err, 'Не удалось изменить статус агента')
      console.error('[useDialogs] toggleDialogAgentStatus error:', err)
      return null
    }
  }

  /**
   * Update dialog status locally (for real-time indicators)
   */
  const updateDialogStatus = (dialogId: string, status: Dialog['status']) => {
    const index = dialogs.value.findIndex(d => d.id === dialogId)
    if (index !== -1) {
      dialogs.value[index] = { ...dialogs.value[index], status }
    }
  }

  /**
   * Update last message preview locally
   */
  const updateLastMessage = (dialogId: string, preview: string, timestamp: string) => {
    const index = dialogs.value.findIndex(d => d.id === dialogId)
    if (index !== -1) {
      dialogs.value[index] = {
        ...dialogs.value[index],
        last_message_preview: preview,
        last_message_at: timestamp
      }
      // Move to top of list
      const dialog = dialogs.value.splice(index, 1)[0]
      dialogs.value.unshift(dialog)
    }
  }

  /**
   * Increment unread count locally
   */
  const incrementUnread = (dialogId: string) => {
    const index = dialogs.value.findIndex(d => d.id === dialogId)
    if (index !== -1) {
      dialogs.value[index] = {
        ...dialogs.value[index],
        unread_count: dialogs.value[index].unread_count + 1
      }
    }
  }

  /**
   * Mark dialog as read
   */
  const markAsRead = (dialogId: string) => {
    const index = dialogs.value.findIndex(d => d.id === dialogId)
    if (index !== -1) {
      dialogs.value[index] = {
        ...dialogs.value[index],
        unread_count: 0
      }
    }
  }

  /**
   * Get dialog by ID
   */
  const getDialogById = (dialogId: string): Dialog | undefined => {
    return dialogs.value.find(d => d.id === dialogId)
  }

  /**
   * Clear dialogs state
   */
  const clearDialogs = () => {
    dialogs.value = []
    currentAgentId.value = null
    error.value = null
  }

  /**
   * Update or insert dialog (for real-time updates)
   */
  const upsertDialog = (dialogData: any) => {
    const id = dialogData.id || dialogData.session_id
    if (!id) return

    const index = dialogs.value.findIndex(d => d.id === id)
    const existing = index !== -1 ? dialogs.value[index] : null
    
    // Get user_info (prioritize new data over existing)
    const userInfo = dialogData.user_info || existing?.user_info
    
    // Generate title from user_info (prioritize over backend title which often contains message preview)
    let userTitle: string | null = null
    if (userInfo) {
      if (userInfo.first_name || userInfo.last_name) {
        userTitle = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ')
      } else if (userInfo.username) {
        userTitle = `@${userInfo.username}`
      }
    }
    
    // Determine platform
    const platform = dialogData.platform || existing?.platform || (id.startsWith('telegram:') ? 'telegram' : undefined)
    
    // For Telegram dialogs without user_info, generate title from ID
    const fallbackTitle = platform === 'telegram' || id.startsWith('telegram:')
      ? `Telegram #${id.replace('telegram:', '')}`
      : 'Диалог'
    
    const finalTitle = userTitle || existing?.title || fallbackTitle
    
    // Map incoming data to Dialog type, then normalize status fields
    const updatedDialog = normalizeDialog({
      ...(existing || {}),
      id,
      title: finalTitle,
      last_message_preview: dialogData.last_message_preview || dialogData.content || existing?.last_message_preview || '',
      last_message_at: dialogData.last_message_at || dialogData.created_at || existing?.last_message_at || new Date().toISOString(),
      unread_count: dialogData.is_new ? (existing?.unread_count ?? 0) + 1 : (existing?.unread_count ?? 0),
      status: dialogData.status || existing?.status || 'NORMAL',
      agent_status: dialogData.agent_status || existing?.agent_status,
      created_at: dialogData.created_at || existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      platform,
      user_info: userInfo || existing?.user_info
    })

    if (index !== -1) {
      // Update existing - move to top to trigger reactivity
      dialogs.value = [
        updatedDialog,
        ...dialogs.value.filter((_, i) => i !== index)
      ]
    } else {
      // Add new dialog to beginning
      dialogs.value = [updatedDialog, ...dialogs.value]
    }
  }

  const resolveDialogId = (rawDialogId: unknown): string | null => {
    if (!rawDialogId) return null
    const rawId = String(rawDialogId)
    // dialogs is ref<Dialog[]>
    const exactMatch = dialogs.value.find(dialog => dialog.id === rawId)
    if (exactMatch) return exactMatch.id
    const suffixMatch = dialogs.value.find(dialog => dialog.id.endsWith(`:${rawId}`))
    return suffixMatch?.id ?? rawId
  }

  return {
    // State - returning refs directly for proper reactivity
    dialogs,
    isLoading,
    error,
    currentAgentId,

    // Actions
    fetchDialogs,
    createDialog,
    updateDialog,
    deleteDialog,
    toggleDialogAgentStatus,
    upsertDialog,
    updateDialogStatus,
    updateLastMessage,
    incrementUnread,
    markAsRead,
    getDialogById,
    resolveDialogId,
    clearDialogs
  }
}
