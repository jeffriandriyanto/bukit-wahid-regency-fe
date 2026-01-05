// composables/useApi.ts
export const useApi = async <T>(url: string, options: any = {}) => {
  const { token, refreshSession, logout } = useAuth()
  const config = useRuntimeConfig()

  return $fetch<T>(url, {
    baseURL: config.public.apiBase,
    ...options,

    onRequest({ options }) {
      options.headers = options.headers || {}
      if (token.value) {
        const h = options.headers as Record<string, string>
        h['Authorization'] = `Bearer ${token.value}`
        h['Accept'] = 'application/json'
      }
    },

    async onResponseError({ response, options: originalOptions }) {
      if (response.status === 401) {
        const newToken = await refreshSession()

        if (newToken) {
          // Destrukturisasi untuk membuang property yang tidak boleh di-looping
          // Kita ambil data, params, query, dll, tapi abaikan callback interceptor-nya
          const { onRequest, onResponse, onResponseError, onRequestError, ...cleanOptions } = originalOptions

          const newHeaders = {
            ...((cleanOptions.headers as unknown) as Record<string, string>),
            Authorization: `Bearer ${newToken}`
          }

          return $fetch(url, {
            ...cleanOptions,
            headers: newHeaders,
            baseURL: config.public.apiBase
          })
        } else {
          logout()
        }
      }
    }
  })
}
