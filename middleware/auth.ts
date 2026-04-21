// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // Si no está autenticado y no está en la página de login
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // Si está autenticado y trata de ir al login, redirigir al dashboard
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})