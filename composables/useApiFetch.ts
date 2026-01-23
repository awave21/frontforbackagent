export const useApiFetch = () => {
  // @ts-ignore - Nuxt 3 auto-imports
  const { public: { apiBase } } = useRuntimeConfig()
  return $fetch.create({ baseURL: apiBase })
}

export const getAuthHeaders = (token?: string | null): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {}
