import { useMutation } from '@tanstack/react-query'
import { authApiClient } from '@/api/auth/AuthApiClient'
import { useAuthStore } from '@/stores/auth.store'

export function useLogout() {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: authApiClient.logout,
    retry: false,
    onSuccess: () => setUser(null),
  })
}
