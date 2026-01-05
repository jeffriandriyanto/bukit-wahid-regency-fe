// composables/useAuth.ts
export const useAuth = () => {
  const token = useState<string | null>('auth_token', () => null)
  const refreshToken = useState<string | null>('refresh_token', () => null)

  const initAuth = () => {
    if (import.meta.client) {
      token.value = localStorage.getItem('access_token')
      refreshToken.value = localStorage.getItem('refresh_token')
    }
  }

  const setTokens = (acc: string, ref: string) => {
    token.value = acc
    refreshToken.value = ref
    localStorage.setItem('access_token', acc)
    localStorage.setItem('refresh_token', ref)
  }

  const logout = () => {
    token.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    return navigateTo('/login')
  }

  const refreshSession = async () => {
    if (!refreshToken.value) return null

    try {
      // Ganti dengan URL refresh token aslimu nanti
      const response = await $fetch<{ access_token: string }>('/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken.value }
      })

      // Simpan token baru
      token.value = response.access_token
      localStorage.setItem('access_token', response.access_token)

      return response.access_token
    } catch (err) {
      return null // Gagal refresh
    }
  }

  return { token, refreshToken, initAuth, setTokens, logout, refreshSession }
}
