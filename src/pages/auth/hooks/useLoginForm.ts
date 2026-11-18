import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { ApiError } from '@/api/errors'
import { authApiClient } from '@/api/auth/AuthApiClient'
import { useLogout } from '@/hooks/useLogout'
import { toast } from '@/lib/toast'
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
    defaultValues: { username: '', password: '' },
  })

  const login = useMutation({
    mutationFn: authApiClient.login,
    retry: false,
    onSuccess: (user) => {
      setUser(user)
      toast.add({ type: 'success', title: 'Zalogowano pomyślnie.' })
    },
    onError: (error) => {
      const field = error instanceof ApiError && error.code === 'AlreadyAuthenticated'
        ? 'root.session'
        : 'root.login'
      setError(field, { message: error.message })
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
