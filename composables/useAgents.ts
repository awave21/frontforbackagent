import { ref, readonly } from 'vue'
import { useApiFetch } from './useApiFetch'
import { useAuth } from './useAuth'
import { getReadableErrorMessage } from '~/utils/api-errors'

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
  sqnsWarning?: string | null
  sqnsTools?: SqnsTool[]
}

export type SqnsResource = {
  id: number
  name: string
  status: string
}

export type SqnsService = {
  id: string
  name: string
  duration: number
  price: number
  price_range?: string
}

export type SqnsSpecialist = {
  id: number
  name: string
  role?: string
  email?: string
  phone?: string
  services_count?: number
  linked_services?: number
  is_active?: boolean
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
  timezone?: string
  llm_params?: {
    temperature?: number
    max_tokens?: number
  }
  status: AgentStatus
  version: number
  created_at: string
  updated_at: string
  sqns_warning?: string | null
  total_cost_usd?: string
  total_cost_rub?: string
}

export type CreateAgentData = {
  name: string
  system_prompt: string
  model: string
  timezone?: string
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
      error.value = getReadableErrorMessage(err, 'Не удалось загрузить список агентов')
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
      error.value = getReadableErrorMessage(err, 'Не удалось создать агента')
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
      error.value = getReadableErrorMessage(err, 'Не удалось загрузить агента')
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
      error.value = getReadableErrorMessage(err, 'Не удалось обновить агента')
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
      error.value = getReadableErrorMessage(err, 'Не удалось удалить агента')
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
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить статус SQNS')
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
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось включить интеграцию SQNS')
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
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось отключить интеграцию SQNS')
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
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить ресурсы SQNS')
      throw err
    }
  }

  const fetchSqnsServices = async (agentId: string) => {
    try {
      const response = await apiFetch<{ services: SqnsService[] }>(`/agents/${agentId}/sqns/services`)

      sqnsServices.value = response.services ?? []
      return sqnsServices.value
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить услуги SQNS')
      throw err
    }
  }

  const syncSqns = async (agentId: string) => {
    try {
      isSqnsLoading.value = true
      sqnsError.value = null
      const response = await apiFetch<any>(`/agents/${agentId}/sqns/sync`, {
        method: 'POST'
      })
      return response
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось синхронизировать SQNS')
      throw err
    } finally {
      isSqnsLoading.value = false
    }
  }

  const fetchSqnsServicesCached = async (agentId: string, params: {
    search?: string,
    category?: string,
    is_enabled?: boolean,
    limit?: number,
    offset?: number
  }) => {
    try {
      const query = new URLSearchParams()
      if (params.search) query.append('search', params.search)
      if (params.category) query.append('category', params.category)
      if (params.is_enabled !== undefined) query.append('is_enabled', params.is_enabled.toString())
      if (params.limit) query.append('limit', params.limit.toString())
      if (params.offset) query.append('offset', params.offset.toString())

      const response = await apiFetch<{ services: any[], total: number }>(`/agents/${agentId}/sqns/services/cached`, {
        query: Object.fromEntries(query)
      })
      return response
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить кэшированные услуги')
      throw err
    }
  }

  const updateSqnsService = async (agentId: string, serviceId: string, data: { is_enabled?: boolean, priority?: number }) => {
    try {
      const url = `/agents/${agentId}/sqns/services/${serviceId}`
      console.log('🚀 PATCH request:', {
        url,
        serviceId,
        serviceIdType: typeof serviceId,
        data,
        dataStringified: JSON.stringify(data)
      })
      
      await apiFetch(url, {
        method: 'PATCH',
        body: data
      })
      
      console.log('✅ PATCH success')
    } catch (err: any) {
      console.error('❌ PATCH failed:', {
        error: err,
        message: err.message,
        data: err.data,
        statusCode: err.statusCode,
        statusMessage: err.statusMessage
      })
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось обновить услугу')
      throw err
    }
  }

  const bulkUpdateSqnsServices = async (agentId: string, data: { ids: string[], is_enabled?: boolean, priority?: number }) => {
    try {
      await apiFetch(`/agents/${agentId}/sqns/services/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      })
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось выполнить массовое обновление услуг')
      throw err
    }
  }

  const fetchSqnsCategories = async (agentId: string) => {
    try {
      const response = await apiFetch<{ categories: any[] }>(`/agents/${agentId}/sqns/categories`)
      return response.categories
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить категории')
      throw err
    }
  }

  const fetchSqnsSpecialists = async (agentId: string) => {
    try {
      const response = await apiFetch<{ specialists: SqnsSpecialist[] }>(`/agents/${agentId}/sqns/specialists`)
      return response.specialists
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить специалистов')
      throw err
    }
  }

  const updateSqnsCategory = async (agentId: string, categoryId: string, data: { is_enabled?: boolean, priority?: number }) => {
    try {
      const url = `/agents/${agentId}/sqns/categories/${categoryId}`
      console.log('🚀 PATCH category request:', {
        url,
        categoryId,
        categoryIdType: typeof categoryId,
        data,
        dataStringified: JSON.stringify(data)
      })
      
      await apiFetch(url, {
        method: 'PATCH',
        body: data
      })
      
      console.log('✅ PATCH category success')
    } catch (err: any) {
      console.error('❌ PATCH category failed:', {
        error: err,
        message: err.message,
        data: err.data,
        statusCode: err.statusCode,
        statusMessage: err.statusMessage
      })
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось обновить категорию')
      throw err
    }
  }

  const getSqnsDisablePreview = async (agentId: string) => {
    try {
      return await apiFetch<any>(`/agents/${agentId}/sqns/disable-preview`)
    } catch (err: any) {
      sqnsError.value = getReadableErrorMessage(err, 'Не удалось загрузить предпросмотр удаления')
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
    syncSqns,
    fetchSqnsServicesCached,
    updateSqnsService,
    bulkUpdateSqnsServices,
    fetchSqnsCategories,
    fetchSqnsSpecialists,
    updateSqnsCategory,
    getSqnsDisablePreview
  }
}