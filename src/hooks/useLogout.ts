import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApiClient } from '@/api/auth/AuthApiClient'
import { useAuthStore } from '@/stores/auth.store'

export function useLogout() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: authApiClient.logout,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      queryClient.removeQueries()
      setUser(null)
    },
  })
}
