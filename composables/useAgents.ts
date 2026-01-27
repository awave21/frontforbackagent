import { ref, readonly } from 'vue'
import { useApiFetch } from './useApiFetch'
import { useAuth } from './useAuth'

export type AgentStatus = 'draft' | 'published'

export type SqnsTool = {
  name: string
  description?: string
  requiredFields?: string[]
  dataSources?: Record<string, string>
}

export type SqnsStatus = {
  sqnsEnabled: boolean
  sqnsHost?: string
  sqnsCredentialId?: string
  sqnsLastSyncAt?: string
  sqnsStatus?: 'ok' | 'error' | string
  sqnsError?: string
  sqnsTools?: SqnsTool[]
}

export type SqnsResource = {
  id: number
  name: string
  status: string
}

export type SqnsService = {
  id: number
  name: string
  duration: number
  price: number
}

export type SqnsSlot = {
  datetime: string
  isAvailable: boolean
}

export type Agent = {
  id: string
  name: string
  system_prompt: string
  model: string
  llm_params?: {
    temperature?: number
    max_tokens?: number
  }
  status: AgentStatus
  version: number
  created_at: string
  updated_at: string
}

export type CreateAgentData = {
  name: string
  system_prompt: string
  model: string
  llm_params?: {
    temperature?: number
    max_tokens?: number
  }
  status?: AgentStatus
  version?: number
}

export const useAgents = () => {
  const { token } = useAuth()
  const apiFetch = useApiFetch()
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const agents = ref<Agent[]>([])
  const sqnsStatus = ref<SqnsStatus | null>(null)
  const sqnsResources = ref<SqnsResource[]>([])
  const sqnsServices = ref<SqnsService[]>([])
  const sqnsSlots = ref<SqnsSlot[]>([])
  const isSqnsLoading = ref(false)
  const sqnsError = ref<string | null>(null)

  // Получение списка агентов
  const fetchAgents = async (params?: { limit?: number; offset?: number }) => {
    try {
      isLoading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const response = await apiFetch<Agent[]>('/agents', {
        query: Object.fromEntries(queryParams)
      })

      agents.value = response
      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки агентов'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Создание нового агента
  const createAgent = async (agentData: CreateAgentData) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiFetch<Agent>('/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: agentData
      })

      // Добавить нового агента в список
      agents.value.unshift(response)

      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка создания агента'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Получение агента по ID
  const getAgent = async (agentId: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiFetch<Agent>(`/agents/${agentId}`)

      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка загрузки агента'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Обновление агента
  const updateAgent = async (agentId: string, updateData: Partial<CreateAgentData>) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiFetch<Agent>(`/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: updateData
      })

      // Обновить агента в списке
      const index = agents.value.findIndex(agent => agent.id === agentId)
      if (index !== -1) {
        agents.value[index] = response
      }

      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка обновления агента'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Удаление агента
  const deleteAgent = async (agentId: string) => {
    try {
      isLoading.value = true
      error.value = null

      await apiFetch(`/agents/${agentId}`, {
        method: 'DELETE'
      })

      // Удалить агента из списка
      agents.value = agents.value.filter(agent => agent.id !== agentId)

    } catch (err: any) {
      error.value = err.message || 'Ошибка удаления агента'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchSqnsStatus = async (agentId: string) => {
    try {
      isSqnsLoading.value = true
      sqnsError.value = null

      const response = await apiFetch<SqnsStatus>(`/agents/${agentId}/sqns`)

      sqnsStatus.value = response
      return response
    } catch (err: any) {
      sqnsError.value = err.message || 'Ошибка загрузки SQNS-статуса'
      throw err
    } finally {
      isSqnsLoading.value = false
    }
  }

  const enableSqns = async (
    agentId: string,
    payload: { host: string; apiKey?: string; email?: string; password?: string; defaultResourceId?: number }
  ) => {
    try {
      isSqnsLoading.value = true
      sqnsError.value = null

      const response = await apiFetch<SqnsStatus>(`/agents/${agentId}/sqns/enable-by-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      })

      sqnsStatus.value = response
      return response
    } catch (err: any) {
      sqnsError.value = err.message || 'Ошибка включения SQNS'
      throw err
    } finally {
      isSqnsLoading.value = false
    }
  }

  const disableSqns = async (agentId: string) => {
    try {
      isSqnsLoading.value = true
      sqnsError.value = null

      await apiFetch<void>(`/agents/${agentId}/sqns`, {
        method: 'DELETE'
      })

      sqnsStatus.value = { sqnsEnabled: false }
    } catch (err: any) {
      sqnsError.value = err.message || 'Ошибка отключения SQNS'
      throw err
    } finally {
      isSqnsLoading.value = false
    }
  }

  const fetchSqnsResources = async (agentId: string) => {
    try {
      const response = await apiFetch<{ resources: SqnsResource[] }>(`/agents/${agentId}/sqns/resources`)

      sqnsResources.value = response.resources ?? []
      return sqnsResources.value
    } catch (err: any) {
      sqnsError.value = err.message || 'Ошибка загрузки ресурсов SQNS'
      throw err
    }
  }

  const fetchSqnsServices = async (agentId: string) => {
    try {
      const response = await apiFetch<{ services: SqnsService[] }>(`/agents/${agentId}/sqns/services`)

      sqnsServices.value = response.services ?? []
      return sqnsServices.value
    } catch (err: any) {
      sqnsError.value = err.message || 'Ошибка загрузки услуг SQNS'
      throw err
    }
  }

  const fetchSqnsSlots = async (agentId: string, params: { resourceId?: number; date?: string }) => {
    try {
      const query = new URLSearchParams()
      if (params.resourceId) query.append('resourceId', params.resourceId.toString())
      if (params.date) query.append('date', params.date)

      const response = await apiFetch<{ slots: SqnsSlot[] }>(`/agents/${agentId}/sqns/slots`, {
        query: Object.fromEntries(query)
      })

      sqnsSlots.value = response.slots ?? []
      return sqnsSlots.value
    } catch (err: any) {
      sqnsError.value = err.message || 'Ошибка загрузки слотов SQNS'
      throw err
    }
  }

  return {
    agents: readonly(agents),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchAgents,
    createAgent,
    getAgent,
    updateAgent,
    deleteAgent,
    sqnsStatus: readonly(sqnsStatus),
    sqnsResources: readonly(sqnsResources),
    sqnsServices: readonly(sqnsServices),
    sqnsSlots: readonly(sqnsSlots),
    isSqnsLoading: readonly(isSqnsLoading),
    sqnsError: readonly(sqnsError),
    fetchSqnsStatus,
    enableSqns,
    disableSqns,
    fetchSqnsResources,
    fetchSqnsServices,
    fetchSqnsSlots
  }
}