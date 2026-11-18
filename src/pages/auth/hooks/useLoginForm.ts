import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { authApiClient } from '@/api/auth/AuthApiClient'
import { useLogout } from '@/hooks/useLogout'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginInput } from '@/types/auth/requests/auth.request.types'
import { loginSchema } from '@/types/auth/schemas/auth.schema'

export function useLoginForm() {
  const setUser = useAuthStore((state) => state.setUser)
  const logout = useLogout()
  const {
    clearErrors,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const login = useMutation({
    mutationFn: authApiClient.login,
    retry: false,
    onSuccess: (user) => setUser(user),
    onError: (error) => {
      const status = isAxiosError(error) ? error.response?.status : undefined

      if (status === 403) {
        setError('root.session', {
          message: 'Poprzednia sesja jest wciąż aktywna. Zakończ ją, aby zalogować się ponownie.',
        })
        return
      }

      setError('root.login', {
        message: status === 401
          ? 'Logowanie odrzucone. Sprawdź dane i aktywność konta.'
          : 'Nie udało się zalogować. Spróbuj ponownie.',
      })
    },
  })

  const submit = handleSubmit((values) => login.mutate(values))

  function endSession() {
    logout.mutate(undefined, { onSuccess: () => clearErrors() })
  }

  return {
    register,
    errors,
    isSubmitting: isSubmitting || login.isPending,
    submit,
    logout,
    endSession,
  }
}
