// composables/useAuth.ts
import { createDirectus, authentication, rest, readMe } from '@directus/sdk'

export const useAuth = () => {
  const config = useRuntimeConfig()

  // Cliente de Directus
  const client = createDirectus(config.public.directusUrl)
    .with(authentication('json'))
    .with(rest())

  // Estado reactivo del usuario
  const user = useState('auth.user', () => null)
  const token = useCookie('auth-token', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7, // 7 días
    httpOnly: false, // Necesario para acceso desde el cliente
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
      console.error('Error en login:', error)
      throw error
    }
  }

  // Logout
  const logout = async () => {
    try {
      await client.logout()
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      token.value = null
      user.value = null
      await navigateTo('/login')
    }
  }

  // Obtener usuario actual
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
      console.error('Error obteniendo usuario:', error)
      await logout()
      return null
    }
  }

  // Verificar si está autenticado
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Refresh token automático
  const refreshToken = async () => {
    if (!token.value) return false

    try {
      const response = await client.refresh()
      token.value = response.access_token
      return true
    } catch (error) {
      console.error('Error refrescando token:', error)
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
