import {
  clearStoredAuthData,
  ensureFreshAccessToken,
  getStoredAccessToken,
  isAccessTokenExpired
} from '../composables/authSessionManager'

export default defineNuxtRouteMiddleware(async (to) => {
  // Пропускаем middleware для главной страницы
  if (to.path === '/') {
    return
  }

  // Проверяем токен только на клиентской стороне
  if (process.client) {
    const accessToken = getStoredAccessToken()

    if (accessToken && !isAccessTokenExpired(accessToken)) {
      return
    }

    const ensuredToken = await ensureFreshAccessToken({ forceRefresh: true })
    if (ensuredToken.token) {
      return
    }

    if (ensuredToken.shouldLogout) {
      clearStoredAuthData()
      return navigateTo('/')
    }

    // На временных ошибках refresh не роняем сессию мгновенно.
  }
})
