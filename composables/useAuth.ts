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
  token: string // access token
  refresh_token?: string // refresh token (опционально, если бэкенд его поддерживает)
  user?: User // опционально, может отсутствовать при получении токена по API ключу
  tenant?: Tenant // опционально, может отсутствовать при получении токена по API ключу
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

// Типы ошибок API
export type ApiError = {
  error: string
  message: string
  details?: Record<string, string[]>
  retry_after?: number
}

// Функция для парсинга ошибок API
const parseApiError = (err: any): ApiError => {
  if (err.data && typeof err.data === 'object') {
    return {
      error: err.data.error || 'unknown_error',
      message: err.data.message || err.message || 'Произошла ошибка',
      details: err.data.details,
      retry_after: err.data.retry_after
    }
  }
  return {
    error: 'unknown_error',
    message: err.message || 'Произошла ошибка'
  }
}

// Типы для JWT payload
export type JWTPayload = {
  sub: string
  tenant_id: string
  scopes: string[]
  iss?: string
  aud?: string
  exp?: number
  iat?: number
  jti?: string
}

// Функция для декодирования JWT токена (без проверки подписи)
const decodeJWT = (token: string): JWTPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }
    
    // Декодируем payload (вторая часть)
    const payload = parts[1]
    // Заменяем URL-safe base64 на обычный base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    // Декодируем base64
    const decoded = atob(base64)
    // Парсим JSON
    return JSON.parse(decoded) as JWTPayload
  } catch (error) {
    console.error('Failed to decode JWT token:', error)
    return null
  }
}

  // Функция для проверки срока действия токена
  const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token)
    if (!payload || !payload.exp) {
      return true // Если нет exp, считаем токен невалидным
    }
    
    // exp в Unix timestamp (секунды), Date.now() в миллисекундах
    const expirationTime = payload.exp * 1000
    const currentTime = Date.now()
    
    // Добавляем буфер в 30 секунд для учета задержек сети и предотвращения вылета во время работы
    return currentTime >= (expirationTime - 30000)
  }

// Функция для проверки валидности токена
const isTokenValid = (token: string | null): boolean => {
  if (!token) {
    return false
  }
  
  // Проверяем формат токена
  if (token.split('.').length !== 3) {
    return false
  }
  
  // Проверяем срок действия
  if (isTokenExpired(token)) {
    return false
  }
  
  return true
}

export const useAuth = () => {
  const apiFetch = useApiFetch()
  const token = ref<string | null>(null) // access token
  const refreshToken = ref<string | null>(null) // refresh token
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
      
      // Сохраняем refresh token, если он пришел
      if (response.refresh_token) {
        refreshToken.value = response.refresh_token
        if (process.client) {
          localStorage.setItem('auth_refresh_token', response.refresh_token)
        }
      }
      
      // Убеждаемся, что scopes всегда является массивом
      if (response.user) {
        const parsedUserData = {
          ...response.user,
          scopes: Array.isArray(response.user.scopes) ? response.user.scopes : []
        }
        user.value = parsedUserData
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(parsedUserData))
        }
      }
      
      if (response.tenant) {
        tenant.value = response.tenant
        if (process.client) {
          localStorage.setItem('auth_tenant', JSON.stringify(response.tenant))
        }
      }

      // Сохранить данные в localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.token)
      }
      
      // Логируем структуру ответа для отладки
      if (process.client) {
        console.log('Register response structure:', {
          has_token: !!response.token,
          has_refresh_token: !!response.refresh_token,
          has_user: !!response.user,
          has_tenant: !!response.tenant
        })
      }

      return response
    } catch (err: any) {
      const apiError = parseApiError(err)
      
      // Формируем сообщение об ошибке
      let errorMessage = apiError.message
      
      // Если есть детали валидации, добавляем их
      if (apiError.details) {
        const detailsMessages = Object.entries(apiError.details)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ')
        errorMessage = `${errorMessage}. ${detailsMessages}`
      }
      
      error.value = errorMessage
      
      // Добавляем информацию об ошибке в объект ошибки для компонента
      err.apiError = apiError
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

      const response = await apiFetch<AuthTokenResponse>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: loginData
      })

      token.value = response.token
      
      // Сохраняем refresh token, если он пришел
      if (response.refresh_token) {
        refreshToken.value = response.refresh_token
        if (process.client) {
          localStorage.setItem('auth_refresh_token', response.refresh_token)
        }
      }
      
      // Убеждаемся, что scopes всегда является массивом
      if (response.user) {
        const parsedUserData = {
          ...response.user,
          scopes: Array.isArray(response.user.scopes) ? response.user.scopes : []
        }
        user.value = parsedUserData
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(parsedUserData))
        }
      }
      
      if (response.tenant) {
        tenant.value = response.tenant
        if (process.client) {
          localStorage.setItem('auth_tenant', JSON.stringify(response.tenant))
        }
      }

      // Сохранить данные в localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.token)
      }
      
      // Логируем структуру ответа для отладки
      if (process.client) {
        console.log('Login response structure:', {
          has_token: !!response.token,
          has_refresh_token: !!response.refresh_token,
          has_user: !!response.user,
          has_tenant: !!response.tenant
        })
      }

      return response
    } catch (err: any) {
      const apiError = parseApiError(err)
      
      // Формируем сообщение об ошибке
      let errorMessage = apiError.message
      
      // Если есть детали валидации, добавляем их
      if (apiError.details) {
        const detailsMessages = Object.entries(apiError.details)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ')
        errorMessage = `${errorMessage}. ${detailsMessages}`
      }
      
      error.value = errorMessage
      
      // Добавляем информацию об ошибке в объект ошибки для компонента
      err.apiError = apiError
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
        refresh_token?: string
      }>('/auth/token', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: { api_key: apiKey }
      })

      token.value = response.token
      
      // Сохраняем refresh token, если он пришел
      if (response.refresh_token) {
        refreshToken.value = response.refresh_token
        if (process.client) {
          localStorage.setItem('auth_refresh_token', response.refresh_token)
        }
      }

      // Сохранить токен в localStorage
      if (process.client) {
        localStorage.setItem('auth_token', response.token)
      }
      
      // Логируем структуру ответа для отладки
      if (process.client) {
        console.log('API Key token response structure:', {
          has_token: !!response.token,
          has_refresh_token: !!response.refresh_token,
          full_response: response
        })
      }

      return response
    } catch (err: any) {
      const apiError = parseApiError(err)
      error.value = apiError.message
      
      // Добавляем информацию об ошибке в объект ошибки для компонента
      err.apiError = apiError
      throw err
    } finally {
      isLoading.value = false
    }
  }


  // Обновление токена через refresh token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      console.warn('No refresh token available')
      return false
    }
    
    if (!process.client) return false
    
    try {
      isLoading.value = true
      error.value = null
      
      // Используем обычный fetch, чтобы избежать циклической зависимости с apiFetch
      // @ts-ignore - Nuxt 3 auto-imports
      const { public: { apiBase } } = useRuntimeConfig()
      
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken.value })
      })
      
      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`)
      }
      
      const data = await response.json() as {
        token: string
        refresh_token?: string
      }
      
      token.value = data.token
      
      // Обновляем refresh token, если пришел новый
      if (data.refresh_token) {
        refreshToken.value = data.refresh_token
        localStorage.setItem('auth_refresh_token', data.refresh_token)
      }
      
      localStorage.setItem('auth_token', data.token)
      
      console.log('✅ Access token refreshed successfully')
      return true
    } catch (err: any) {
      console.error('❌ Failed to refresh token:', err)
      
      // Проверяем тип ошибки
      const status = err?.status || err?.statusCode || err?.response?.status || 
                     (err?.message?.includes('status') ? parseInt(err.message.match(/\d+/)?.[0] || '0') : 0)
      
      // Если это 401 или 403 - refresh token невалиден, делаем logout
      if (status === 401 || status === 403) {
        console.warn('Refresh token invalid or expired, logging out')
        logout()
      } else if (status === 500) {
        // Если 500 - проблема на сервере, не делаем logout
        // Пользователь может продолжать работать со старым токеном
        console.warn('⚠️  Server error during token refresh (500), keeping current session')
        console.warn('   Пользователь может продолжать работу, но сессия может прерваться при истечении токена')
      } else {
        // Другие ошибки - не делаем logout, возможно временная проблема
        console.warn('⚠️  Error during token refresh, keeping current session')
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Выход
  const logout = () => {
    token.value = null
    refreshToken.value = null
    user.value = null
    tenant.value = null
    if (process.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_refresh_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_tenant')
      // Перенаправляем на главную страницу после выхода
      // Используем window.location для надежного перенаправления
      window.location.href = '/'
    }
    error.value = null
  }

  // Восстановление данных при инициализации
  const initializeAuth = async () => {
    if (!process.client) return
    
    const savedToken = localStorage.getItem('auth_token')
    const savedRefreshToken = localStorage.getItem('auth_refresh_token')
    const savedUser = localStorage.getItem('auth_user')
    const savedTenant = localStorage.getItem('auth_tenant')

    // Восстанавливаем refresh token
    if (savedRefreshToken) {
      refreshToken.value = savedRefreshToken
    }

    // Проверяем валидность токена перед восстановлением
    if (savedToken && isTokenValid(savedToken)) {
      token.value = savedToken
      
      // Если токен скоро истечет (менее чем через 5 минут), попробуем обновить его
      const payload = decodeJWT(savedToken)
      if (payload && payload.exp) {
        const expirationTime = payload.exp * 1000
        const currentTime = Date.now()
        const timeUntilExpiry = expirationTime - currentTime
        const fiveMinutes = 5 * 60 * 1000
        
        // Если токен истечет менее чем через 5 минут и есть refresh token, обновляем
        if (timeUntilExpiry < fiveMinutes && refreshToken.value) {
          console.log('Access token expires soon, refreshing...')
          await refreshAccessToken()
        }
      }
    } else if (savedToken) {
      // Токен истек или невалиден - пробуем обновить через refresh token
      if (refreshToken.value) {
        console.log('Access token expired, attempting refresh...')
        const refreshed = await refreshAccessToken()
        if (refreshed) {
          // Токен успешно обновлен, продолжаем
        } else {
          // Не удалось обновить - очищаем
          console.warn('Failed to refresh token, clearing auth data')
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_refresh_token')
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_tenant')
          token.value = null
          refreshToken.value = null
          user.value = null
          tenant.value = null
          return
        }
      } else {
        // Нет refresh token - очищаем
        console.warn('Token expired or invalid, no refresh token available, clearing auth data')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_tenant')
        token.value = null
        refreshToken.value = null
        user.value = null
        tenant.value = null
        return
      }
    }
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        // Убеждаемся, что scopes всегда является массивом
        if (!Array.isArray(parsedUser.scopes)) {
          parsedUser.scopes = []
        }
        user.value = parsedUser
      } catch (e) {
        console.error('Failed to parse saved user data', e)
      }
    }
    if (savedTenant) {
      try {
        tenant.value = JSON.parse(savedTenant)
      } catch (e) {
        console.error('Failed to parse saved tenant data', e)
      }
    }
  }

  // Выполняется при монтировании composable
  onMounted(() => {
    initializeAuth()
  })

  return {
    token: readonly(token),
    refreshToken: readonly(refreshToken),
    user: readonly(user),
    tenant: readonly(tenant),
    isLoading: readonly(isLoading),
    error: readonly(error),
    register,
    login,
    loginWithApiKey,
    refreshAccessToken,
    logout,
    isAuthenticated: computed(() => {
      if (!token.value) return false
      // Проверяем валидность токена при каждом обращении
      if (!isTokenValid(token.value)) {
        // Токен истек - пробуем обновить через refresh token
        if (refreshToken.value && process.client) {
          // Асинхронное обновление токена (не блокируем computed)
          refreshAccessToken().catch(() => {
            // Если обновление не удалось, очищаем
            if (process.client) {
              localStorage.removeItem('auth_token')
              localStorage.removeItem('auth_refresh_token')
              localStorage.removeItem('auth_user')
              localStorage.removeItem('auth_tenant')
            }
            token.value = null
            refreshToken.value = null
            user.value = null
            tenant.value = null
          })
          // Пока обновляем, считаем авторизованным (если есть refresh token)
          return !!refreshToken.value
        } else {
          // Нет refresh token - очищаем
          if (process.client) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('auth_refresh_token')
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_tenant')
          }
          token.value = null
          refreshToken.value = null
          user.value = null
          tenant.value = null
          return false
        }
      }
      return true
    }),
    // Функции для работы с JWT
    decodeToken: (token: string | null) => token ? decodeJWT(token) : null,
    isTokenExpired: (token: string | null) => token ? isTokenExpired(token) : true,
    isTokenValid: (token: string | null) => isTokenValid(token)
  }
}