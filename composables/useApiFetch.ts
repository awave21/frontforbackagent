// Функция для проверки срока действия JWT токена
const isTokenExpired = (token: string): boolean => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    const jwtPayload = JSON.parse(decoded)

    if (!jwtPayload.exp) return true

    const expirationTime = jwtPayload.exp * 1000
    const currentTime = Date.now()

    return currentTime >= (expirationTime - 30000) // Буфер 30 секунд
  } catch {
    return true
  }
}

let navigateTo: any = null
let refreshPromise: Promise<boolean> | null = null

// Функция для обновления токена через refresh token
const refreshAccessToken = async (): Promise<boolean> => {
  if (!process.client) return false
  
  const refreshToken = localStorage.getItem('auth_refresh_token')
  if (!refreshToken) {
    console.warn('No refresh token available for token refresh')
    return false
  }
  
  // Если уже идет обновление, ждем его
  if (refreshPromise) {
    return refreshPromise
  }
  
  // @ts-ignore - Nuxt 3 auto-imports
  const { public: { apiBase } } = useRuntimeConfig()
  
  refreshPromise = (async () => {
    try {
      // Используем обычный fetch, чтобы избежать циклической зависимости с $fetch
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      
      if (!response.ok) {
        throw new Error(`Refresh failed with status ${response.status}`)
      }
      
      const data = await response.json() as {
        token: string
        refresh_token?: string
      }
      
      // Обновляем токены
      localStorage.setItem('auth_token', data.token)
      if (data.refresh_token) {
        localStorage.setItem('auth_refresh_token', data.refresh_token)
      }
      
      console.log('✅ Access token refreshed successfully')
      return true
    } catch (err: any) {
      console.error('❌ Failed to refresh access token:', err)
      
      // Проверяем тип ошибки
      const status = err?.status || err?.statusCode || err?.response?.status
      
      // Если это 401 или 403 - refresh token невалиден, очищаем все
      if (status === 401 || status === 403) {
        console.warn('Refresh token invalid or expired, clearing auth data')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_tenant')
      } else if (status === 500) {
        // Если 500 - проблема на сервере, не очищаем токены
        // Пользователь может продолжать работать со старым токеном
        console.warn('Server error during token refresh, keeping current tokens')
      } else {
        // Другие ошибки - очищаем только если это явная ошибка авторизации
        console.warn('Unknown error during token refresh, keeping current tokens')
      }
      
      return false
    } finally {
      refreshPromise = null
    }
  })()
  
  return refreshPromise
}

export const useApiFetch = () => {
  // @ts-ignore - Nuxt 3 auto-imports
  const { public: { apiBase } } = useRuntimeConfig()

  // Инициализируем navigateTo только один раз
  if (!navigateTo && process.client) {
    try {
      // @ts-ignore - Nuxt 3 auto-imports
      navigateTo = useNuxtApp().$router?.push || (() => window.location.href = '/')
    } catch {
      navigateTo = () => window.location.href = '/'
    }
  }
  
  return $fetch.create({
    baseURL: apiBase,
    async onRequest({ options }) {
      // Автоматически добавляем токен авторизации, если он есть
      // Получаем токен динамически при каждом запросе
      if (process.client) {
        let token = localStorage.getItem('auth_token')
        
        // Проверяем валидность токена перед использованием
        if (token) {
          if (isTokenExpired(token)) {
            // Токен истек - пробуем обновить через refresh token
            const refreshed = await refreshAccessToken()
            if (refreshed) {
              // Получаем новый токен
              token = localStorage.getItem('auth_token')
            } else {
              // Не удалось обновить - не добавляем токен в запрос
              return
            }
          }
          
          if (token) {
            const existingHeaders = (options.headers as unknown as Record<string, string>) || {}
            // $fetch поддерживает объекты для headers, но TypeScript этого не знает
            // Используем двойное приведение через unknown для обхода строгой типизации
            ;(options as any).headers = {
              ...existingHeaders,
              Authorization: `Bearer ${token}`
            }
          }
        }
      }
    },
    async onResponseError({ request, response, options }) {
      // Если получили 401, пробуем обновить токен и повторить запрос
      if (response.status === 401 && process.client) {
        const refreshToken = localStorage.getItem('auth_refresh_token')
        
        // Пробуем обновить токен, если есть refresh token
        if (refreshToken) {
          console.log('Received 401, attempting to refresh token...')
          const refreshed = await refreshAccessToken()
          
          if (refreshed) {
            // Токен обновлен - повторяем запрос с новым токеном
            const newToken = localStorage.getItem('auth_token')
            if (newToken) {
              // Обновляем заголовок авторизации
              const existingHeaders = (options.headers as unknown as Record<string, string>) || {}
              ;(options as any).headers = {
                ...existingHeaders,
                Authorization: `Bearer ${newToken}`
              }
              
              // Повторяем запрос (но это не работает напрямую в onResponseError)
              // Вместо этого просто возвращаем, чтобы вызывающий код мог повторить запрос
              console.log('Token refreshed, request should be retried by caller')
              return
            }
          }
        }
        
        // Если refresh не удался или нет refresh token, очищаем и перенаправляем
        console.warn('Authentication token expired or invalid, redirecting to login')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_tenant')
        // Используем navigateTo для перенаправления
        if (navigateTo) {
          navigateTo('/', { replace: true })
        } else {
          window.location.href = '/'
        }
      }

      // Обработка 429 (Rate Limiting)
      // Ошибка будет обработана в компоненте через apiError.retry_after
      // Здесь только логируем для отладки
      if (response.status === 429 && process.client) {
        const retryAfter = response.headers?.get('retry-after') || '60'
        console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
      }
    }
  })
}

export const getAuthHeaders = (token?: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {}
