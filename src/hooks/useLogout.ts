import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { authApiClient } from '@/api/auth/AuthApiClient'
import { useAuthStore } from '@/stores/auth.store'

export function useLogout() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: async () => {
      try {
        await authApiClient.logout()
      } catch (error) {
        if (!isAxiosError(error) || error.response?.status !== 401) {
          throw error
        }
      }
    },
    retry: false,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      queryClient.removeQueries()
      setUser(null)
    },
  })
}
