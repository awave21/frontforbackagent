import { ref, shallowRef, triggerRef } from 'vue'
import type { Dialog, CreateDialogData, UpdateDialogData, DialogsListResponse } from '../types/dialogs'
import { useApiFetch } from './useApiFetch'

// Shared state across components - using shallowRef for better reactivity with arrays
const dialogs = shallowRef<Dialog[]>([])
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

      console.log(`[useDialogs] Fetching dialogs from: ${url}`)

      const response = await apiFetch<DialogsListResponse | Dialog[]>(url)
      
      console.log(`[useDialogs] Raw response:`, response)
      console.log(`[useDialogs] Response type:`, Array.isArray(response) ? 'array' : typeof response)
      
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
      
      console.log(`[useDialogs] Received ${dialogsList.length} dialogs`, {
        agentId,
        dialogs: dialogsList
      })

      dialogs.value = dialogsList
      triggerRef(dialogs) // Force reactivity update
      console.log(`[useDialogs] dialogs.value set to:`, dialogs.value)
    } catch (err: any) {
      console.error('[useDialogs] Error fetching dialogs:', err)
      console.error('[useDialogs] Error details:', {
        status: err?.statusCode || err?.status,
        data: err?.data,
        message: err?.message
      })
      const msg = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Не удалось загрузить диалоги'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
      dialogs.value = []
      triggerRef(dialogs)
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

      // Add to the beginning of the list
      dialogs.value = [response, ...dialogs.value]
      return response
    } catch (err: any) {
      const msg = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Не удалось создать диалог'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
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
      const response = await apiFetch<Dialog>(`agents/${agentId}/dialogs/${dialogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: data
      })

      // Update in local state
      const index = dialogs.value.findIndex(d => d.id === dialogId)
      if (index !== -1) {
        dialogs.value[index] = response
      }

      return response
    } catch (err: any) {
      const msg = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Не удалось обновить диалог'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
      return null
    }
  }

  /**
   * Delete a dialog
   */
  const deleteDialog = async (agentId: string, dialogId: string): Promise<boolean> => {
    if (!agentId || !dialogId) return false

    try {
      await apiFetch(`agents/${agentId}/dialogs/${dialogId}`, {
        method: 'DELETE'
      })

      // Remove from local state
      dialogs.value = dialogs.value.filter(d => d.id !== dialogId)
      return true
    } catch (err: any) {
      const msg = err?.data?.detail ?? err?.data?.message ?? err?.message ?? 'Не удалось удалить диалог'
      error.value = typeof msg === 'string' ? msg : JSON.stringify(msg)
      return false
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
    
    // Map incoming data to Dialog type if needed
    const updatedDialog: Dialog = {
      ...(index !== -1 ? dialogs.value[index] : {} as Dialog),
      id,
      title: dialogData.title || (index !== -1 ? dialogs.value[index].title : 'Новый диалог'),
      last_message_preview: dialogData.last_message_preview || dialogData.content || (index !== -1 ? dialogs.value[index].last_message_preview : ''),
      last_message_at: dialogData.last_message_at || dialogData.created_at || (index !== -1 ? dialogs.value[index].last_message_at : new Date().toISOString()),
      unread_count: dialogData.is_new ? (index !== -1 ? dialogs.value[index].unread_count + 1 : 1) : (index !== -1 ? dialogs.value[index].unread_count : 0),
      status: dialogData.status || (index !== -1 ? dialogs.value[index].status : 'NORMAL'),
      created_at: dialogData.created_at || (index !== -1 ? dialogs.value[index].created_at : new Date().toISOString()),
      updated_at: new Date().toISOString()
    }

    if (index !== -1) {
      // Update existing
      dialogs.value[index] = updatedDialog
      // Move to top
      const [item] = dialogs.value.splice(index, 1)
      dialogs.value.unshift(item)
    } else {
      // Add new to beginning
      dialogs.value.unshift(updatedDialog)
    }
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
    upsertDialog,
    updateDialogStatus,
    updateLastMessage,
    incrementUnread,
    markAsRead,
    getDialogById,
    clearDialogs
  }
}
