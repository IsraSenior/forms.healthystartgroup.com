// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  // If not authenticated and not on the login page
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If authenticated and trying to access login, redirect to dashboard
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})