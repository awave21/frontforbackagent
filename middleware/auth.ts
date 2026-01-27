// Функция для декодирования JWT (без проверки подписи)
const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// Функция для проверки срока действия токена
const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token)
  if (!payload || !payload.exp) return true
  
  const expirationTime = payload.exp * 1000
  const currentTime = Date.now()
  
  return currentTime >= (expirationTime - 30000) // Буфер 30 секунд
}

export default defineNuxtRouteMiddleware((to) => {
  // Пропускаем middleware для главной страницы
  if (to.path === '/') {
    return
  }

  // Проверяем токен только на клиентской стороне
  if (process.client) {
    const token = localStorage.getItem('auth_token')

    // Если токена нет или он истек, перенаправляем на главную страницу
    if (!token || isTokenExpired(token)) {
      // Очищаем истекший токен
      if (token) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_tenant')
      }
      return navigateTo('/')
    }
  }
})