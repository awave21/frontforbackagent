import { ref, computed, onMounted, readonly } from 'vue'
import { useApiFetch } from './useApiFetch'

// Auth interfaces
export type User = {
  id: string
  tenant_id: string
  email: string
  full_name: string
  role: string
  scopes: string[]
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string | null
}

export type Tenant = {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export type AuthTokenResponse = {
  token: string
  user: User
  tenant: Tenant
}

export type UserRegister = {
  email: string
  password: string
  full_name?: string
  tenant_name?: string
}

export type UserLogin = {
  email: string
  password: string
}

export const useAuth = () => {
  const apiFetch = useApiFetch()
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const tenant = ref<Tenant | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Регистрация нового пользователя
  const register = async (userData: UserRegister) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiFetch<AuthTokenResponse>('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: userData
      })

      token.value = response.token
      user.value = response.user
      tenant.value = response.tenant

      // Сохранить данные в localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      localStorage.setItem('auth_tenant', JSON.stringify(response.tenant))

      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка регистрации'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Вход по email и паролю
  const login = async (loginData: UserLogin) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiFetch<{
        token: string
        user: User
        tenant: Tenant
      }>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: loginData
      })

      token.value = response.token
      user.value = response.user
      tenant.value = response.tenant

      // Сохранить данные в localStorage
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(response.user))
      localStorage.setItem('auth_tenant', JSON.stringify(response.tenant))

      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка входа'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Получение токена по API-ключу
  const loginWithApiKey = async (apiKey: string) => {
    try {
      isLoading.value = true
      error.value = null

      const response = await apiFetch<{
        token: string
      }>('/auth/token', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: { api_key: apiKey }
      })

      token.value = response.token

      // Сохранить токен в localStorage
      localStorage.setItem('auth_token', response.token)

      return response
    } catch (err: any) {
      error.value = err.message || 'Ошибка аутентификации'
      throw err
    } finally {
      isLoading.value = false
    }
  }


  // Выход
  const logout = () => {
    token.value = null
    user.value = null
    tenant.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_tenant')
    error.value = null
  }

  // Восстановление данных при инициализации
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    const savedTenant = localStorage.getItem('auth_tenant')

    if (savedToken) {
      token.value = savedToken
    }
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        console.error('Failed to parse saved user data')
      }
    }
    if (savedTenant) {
      try {
        tenant.value = JSON.parse(savedTenant)
      } catch (e) {
        console.error('Failed to parse saved tenant data')
      }
    }
  }

  // Выполняется при монтировании composable
  onMounted(() => {
    initializeAuth()
  })

  return {
    token: readonly(token),
    user: readonly(user),
    tenant: readonly(tenant),
    isLoading: readonly(isLoading),
    error: readonly(error),
    register,
    login,
    loginWithApiKey,
    logout,
    isAuthenticated: computed(() => !!token.value)
  }
}