import { getAuthHeaders, useApiFetch } from './useApiFetch'

export type AgentStatus = 'draft' | 'published'

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

  // Получение списка агентов
  const fetchAgents = async (params?: { limit?: number; offset?: number }) => {
    try {
      isLoading.value = true
      error.value = null

      const queryParams = new URLSearchParams()
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.offset) queryParams.append('offset', params.offset.toString())

      const response = await apiFetch<Agent[]>('/agents', {
        headers: getAuthHeaders(token.value),
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
          ...getAuthHeaders(token.value),
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

      const response = await apiFetch<Agent>(`/agents/${agentId}`, {
        headers: getAuthHeaders(token.value)
      })

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
          ...getAuthHeaders(token.value),
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
        method: 'DELETE',
        headers: getAuthHeaders(token.value)
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

  return {
    agents: readonly(agents),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchAgents,
    createAgent,
    getAgent,
    updateAgent,
    deleteAgent
  }
}