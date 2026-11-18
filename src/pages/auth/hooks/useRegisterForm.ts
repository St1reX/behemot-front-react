import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authApiClient } from '@/api/auth/AuthApiClient'
import type { RegisterInput } from '@/types/auth/requests/auth.request.types'
import { registerSchema } from '@/types/auth/schemas/auth.schema'

export function useRegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  })

  const registration = useMutation({
    mutationFn: authApiClient.register,
    retry: false,
    onSuccess: () => reset(),
    onError: (error) => {
      setError('root.register', { message: error.message })
    },
  })

  const submit = handleSubmit((values) => registration.mutate(values))

  return {
    register,
    errors,
    isSubmitting: isSubmitting || registration.isPending,
    isRegistered: registration.isSuccess,
    submit,
  }
}
