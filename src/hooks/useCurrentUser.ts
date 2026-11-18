import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { authApiClient } from '@/api/auth/AuthApiClient'

export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await authApiClient.me()
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          return null
        }

        throw error
      }
    },
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
