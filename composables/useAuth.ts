// composables/useAuth.ts
import { createDirectus, authentication, rest, readMe } from '@directus/sdk'

export const useAuth = () => {
  const config = useRuntimeConfig()

  // Directus client
  const client = createDirectus(config.public.directusUrl)
    .with(authentication('json'))
    .with(rest())

  // Reactive auth state
  const user = useState('auth.user', () => null)
  const token = useCookie('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: false, // Required for client-side access
    secure: true,
    sameSite: 'strict'
  })

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await client.login(email, password, {
        mode: 'json'
      })

      token.value = response.access_token
      await getCurrentUser()

      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await client.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }

  // Get current user
  const getCurrentUser = async () => {
    if (!token.value) return null

    try {
      client.setToken(token.value)

      const currentUser = await client.request(
        readMe({
          fields: ['*', 'role.name']
        })
      )

      user.value = currentUser
      return currentUser
    } catch (error) {
      console.error('Error fetching current user:', error)
      await logout()
      return null
    }
  }

  // Check if authenticated
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Automatic token refresh
  const refreshToken = async () => {
    if (!token.value) return false

    try {
      const response = await client.refresh()
      token.value = response.access_token
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout()
      return false
    }
  }

  return {
    client,
    user: readonly(user),
    token: readonly(token),
    login,
    logout,
    getCurrentUser,
    checkAuth: getCurrentUser,
    isAuthenticated,
    refreshToken
  }
}
