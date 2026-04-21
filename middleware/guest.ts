// middleware/guest.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // Solo permitir acceso a usuarios no autenticados
  if (isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})