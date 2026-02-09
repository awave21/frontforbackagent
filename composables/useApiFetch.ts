// Nuxt auto-imports $fetch; explicit import for TypeScript
import { $fetch } from 'ofetch'

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

// Глобальный промис-кэш для refresh (синхронизирован с useAuth через window)
// Это позволяет избежать дублирующих refresh запросов из разных мест
declare global {
  interface Window {
    __refreshTokenPromise?: Promise<boolean> | null
  }
}

// Функция для обновления токена через refresh token
// Использует глобальный промис-кэш для синхронизации с useAuth
const refreshAccessToken = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false
  
  const refreshToken = localStorage.getItem('auth_refresh_token')
  if (!refreshToken) {
    console.warn('⚠️  No refresh token available for token refresh')
    return false
  }
  
  // Проверяем глобальный промис-кэш (используется useAuth)
  if (window.__refreshTokenPromise) {
    console.log('🔄 Refresh already in progress (from useAuth), waiting for result...')
    return window.__refreshTokenPromise
  }
  
  // Если useAuth не используется, создаем свой refresh
  // Но лучше использовать useAuth для единообразия
  console.warn('⚠️  refreshAccessToken called from useApiFetch - consider using useAuth().refreshAccessToken() instead')
  
  // @ts-ignore - Nuxt 3 auto-imports
  const { public: { apiBase } } = useRuntimeConfig()
  
  const promise = (async () => {
    try {
      // Используем обычный fetch, чтобы избежать циклической зависимости с $fetch
      const response = await fetch(`${apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
      })
      
      // Обработка 409 Conflict
      if (response.status === 409) {
        console.log('⚠️  Received 409 Conflict - token is being processed, waiting...')
        // Ждем немного и проверяем глобальный промис
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (window.__refreshTokenPromise) {
          return window.__refreshTokenPromise
        }
        throw new Error(`Refresh failed with status ${response.status}`)
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorData: any = {}
        try {
          errorData = errorText ? JSON.parse(errorText) : {}
        } catch {
          // Не удалось распарсить JSON
        }
        
        console.error(`❌ Refresh failed with status ${response.status}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        
        throw {
          status: response.status,
          statusCode: response.status,
          message: `Refresh failed with status ${response.status}`,
          data: errorData
        }
      }
      
      const data = await response.json() as {
        token: string
        refresh_token?: string
      }
      
      // ВАЖНО: Обновляем refresh token в хранилище
      localStorage.setItem('auth_token', data.token)
      if (data.refresh_token) {
        localStorage.setItem('auth_refresh_token', data.refresh_token)
        console.log('✅ Refresh token updated in storage')
      } else {
        console.warn('⚠️  Server did not return refresh_token in response')
      }
      
      console.log('✅ Access token refreshed successfully')
      return true
    } catch (err: any) {
      console.error('❌ Failed to refresh access token:', err)
      
      // Проверяем тип ошибки
      const status = err?.status || err?.statusCode || err?.response?.status
      
      // Если это 401 или 403 - refresh token невалиден, очищаем все
      if (status === 401 || status === 403) {
        console.warn('🔴 Refresh token invalid or expired, clearing auth data')
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_refresh_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_tenant')
      } else if (status === 409) {
        // 409 уже обработано выше
        console.warn('⚠️  409 Conflict during refresh')
      } else if (status === 500) {
        // Если 500 - проблема на сервере, не очищаем токены
        console.warn('⚠️  Server error during token refresh, keeping current tokens')
      } else {
        // Другие ошибки - не очищаем токены
        console.warn('⚠️  Unknown error during token refresh, keeping current tokens')
      }
      
      return false
    }
  })()
  
  // Сохраняем в глобальный промис-кэш СРАЗУ после создания
  window.__refreshTokenPromise = promise
  
  // Очищаем промис после завершения
  promise.finally(() => {
    if (window.__refreshTokenPromise === promise) {
      window.__refreshTokenPromise = null
    }
  })
  
  return promise
}

export const useApiFetch = () => {
  // @ts-ignore - Nuxt 3 auto-imports
  const { public: { apiBase } } = useRuntimeConfig()

  // Инициализируем navigateTo только один раз
  if (!navigateTo && typeof window !== 'undefined') {
    try {
      // @ts-ignore - Nuxt 3 auto-imports
      navigateTo = useNuxtApp().$router?.push || (() => window.location.href = '/')
    } catch {
      navigateTo = () => window.location.href = '/'
    }
  }

  const apiFetch = $fetch.create({
    baseURL: apiBase,
    async onRequest({ request, options }) {
      // Автоматически добавляем токен авторизации, если он есть
      // Получаем токен динамически при каждом запросе
      if (typeof window !== 'undefined') {
        // Для эндпоинтов login/register НЕ нужна авторизация и обновление токена —
        // они принимают email/password, а не Bearer token
        const reqUrl = typeof request === 'string' ? request : (request as Request).url
        const isPublicAuthEndpoint = reqUrl.includes('/auth/login') || reqUrl.includes('/auth/register')
        if (isPublicAuthEndpoint) return

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
      const retryOptions = options as any

      // Определяем URL запроса для проверки типа
      const requestUrl = typeof request === 'string' ? request : (request as Request).url

      // Если получили 401, пробуем обновить токен и повторить запрос
      // НО: для эндпоинтов аутентификации (login, register) НЕ делаем retry —
      // 401 на login означает неверные учётные данные, а не истекший токен
      const isLoginOrRegister = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')

      if (response.status === 401 && typeof window !== 'undefined' && !isLoginOrRegister) {
        // Защита от бесконечного цикла ретраев
        if (retryOptions?._retry) {
          console.warn('🔴 Request retried and still unauthorized, redirecting to login')
        } else {
          retryOptions._retry = true
        }

        const refreshToken = localStorage.getItem('auth_refresh_token')
        
        // Пробуем обновить токен, если есть refresh token
        if (refreshToken && !retryOptions?._forceLogout) {
          console.log('🔐 Received 401, attempting to refresh token...')
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

              // Повторяем запрос с обновлённым токеном
              console.log('✅ Token refreshed, retrying original request')
              return await apiFetch(request as any, options as any)
            }
          }
        }
        
        // Если refresh не удался или нет refresh token, очищаем и перенаправляем
        console.warn('🔴 Authentication token expired or invalid, redirecting to login')
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
      
      // Обработка 409 Conflict - только для auth-запросов (token refresh)
      // Для других запросов 409 означает бизнес-конфликт (например, "ресурс уже существует")
      const isAuthRequest = requestUrl.includes('/auth/')
      
      if (response.status === 409 && typeof window !== 'undefined' && isAuthRequest) {
        console.log('⚠️  Received 409 Conflict on auth request - token refresh in progress, waiting...')
        const refreshToken = localStorage.getItem('auth_refresh_token')
        
        if (refreshToken) {
          // Ждем завершения активного refresh
          if (window.__refreshTokenPromise) {
            console.log('⏳ Waiting for active refresh to complete...')
            await window.__refreshTokenPromise
            
            // После завершения refresh, повторяем запрос с новым токеном
            const newToken = localStorage.getItem('auth_token')
            if (newToken) {
              const existingHeaders = (options.headers as unknown as Record<string, string>) || {}
              ;(options as any).headers = {
                ...existingHeaders,
                Authorization: `Bearer ${newToken}`
              }
              // Защита от бесконечного цикла ретраев
              if (!retryOptions?._retry) retryOptions._retry = true
              console.log('✅ Refresh completed, retrying original request')
              return await apiFetch(request as any, options as any)
            }
          }
        }
      }

      // Обработка 403 (Forbidden) - недостаточно прав
      if (response.status === 403 && typeof window !== 'undefined') {
        const isAuthRequestFor403 = requestUrl.includes('/auth/')
        
        // Для не-auth запросов показываем сообщение о недостаточных правах
        if (!isAuthRequestFor403) {
          // Используем динамический импорт useToast, чтобы избежать циклических зависимостей
          try {
            const { useToast } = await import('./useToast')
            const toast = useToast()
            toast.error('Недостаточно прав', 'У вас нет доступа к выполнению этого действия.')
          } catch (err) {
            console.error('Failed to show 403 error toast:', err)
          }
        }
        
        // Не очищаем токены для 403 (в отличие от 401)
        // Пользователь авторизован, но не имеет прав на действие
        console.warn('🔒 Access forbidden (403):', {
          url: requestUrl,
          message: 'Insufficient permissions'
        })
      }

      // Обработка 429 (Rate Limiting)
      // Ошибка будет обработана в компоненте через apiError.retry_after
      // Здесь только логируем для отладки
      if (response.status === 429 && typeof window !== 'undefined') {
        const retryAfter = response.headers?.get('retry-after') || '60'
        console.warn(`Rate limit exceeded. Retry after ${retryAfter} seconds`)
      }

      // Обработка 502, 503, 504 - Gateway/Server errors
      if ([502, 503, 504].includes(response.status) && typeof window !== 'undefined') {
        const statusText = response.status === 502 ? 'Bad Gateway' 
                         : response.status === 503 ? 'Service Unavailable'
                         : 'Gateway Timeout'
        console.error(`❌ ${statusText} (${response.status}):`, {
          url: request,
          status: response.status,
          statusText: response.statusText,
          message: `Backend server is not responding. Please try again later.`
        })
      }

      // Логируем все остальные ошибки для отладки
      if (typeof window !== 'undefined' && response.status >= 500) {
        console.error(`❌ Server error (${response.status}):`, {
          url: request,
          status: response.status,
          statusText: response.statusText
        })
      }
    }
  })

  return apiFetch
}

export const getAuthHeaders = (token?: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {}
