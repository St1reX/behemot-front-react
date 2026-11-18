import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { authApiClient } from '@/api/auth/AuthApiClient'
import type { RegisterInput } from '@/types/auth/requests/auth.request.types'
import { registerSchema } from '@/types/auth/schemas/auth.schema'

export function useRegisterForm() {
  const [isRegistered, setIsRegistered] = useState(false)
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

  const submit = handleSubmit(async (values) => {
    try {
      await authApiClient.register(values)
      reset()
      setIsRegistered(true)
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      let message = 'Nie udało się zarejestrować. Spróbuj ponownie.'

      if (status === 409) {
        message = 'Adres e-mail lub nazwa użytkownika są już zajęte.'
      } else if (status === 403) {
        message = 'Masz już aktywną sesję. Odśwież stronę, aby przejść do swojego konta.'
      } else if (status === 422) {
        message = 'Sprawdź poprawność danych formularza.'
      } else if (status === 429) {
        message = 'Zbyt wiele prób rejestracji. Spróbuj ponownie później.'
      }

      setError('root.register', { message })
    }
  })

  return { register, errors, isSubmitting, isRegistered, submit }
}
