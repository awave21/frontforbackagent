export default defineNuxtRouteMiddleware((to) => {
  // Пропускаем middleware для главной страницы
  if (to.path === '/') {
    return
  }

  // Проверяем, есть ли токен в localStorage
  const token = localStorage.getItem('auth_token')

  // Если токена нет, перенаправляем на главную страницу
  // (где будет показано модальное окно аутентификации)
  if (!token) {
    return navigateTo('/')
  }
})