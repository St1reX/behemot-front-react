import { zodResolver } from '@hookform/resolvers/zod'
import { isAxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { authApiClient } from '@/api/auth/AuthApiClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLogout } from '@/hooks/useLogout'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginInput } from '@/types/auth/requests/auth.request.types'
import { loginSchema } from '@/types/auth/schemas/auth.schema'

export function LoginPage() {
  const setUser = useAuthStore((state) => state.setUser)
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
  const logout = useLogout()
  const hasExistingSession = Boolean(errors.root?.session)

  const submit = handleSubmit(async (values) => {
    try {
      setUser(await authApiClient.login(values))
    } catch (error) {
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
    }
  })

  return (
    <main>
      <h1>Logowanie do Behemota</h1>
      <form
        className="max-w-sm space-y-4"
        noValidate
        onSubmit={hasExistingSession ? (event) => event.preventDefault() : submit}
      >
        <div className="space-y-1.5">
          <label htmlFor="email">Adres e-mail</label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && <p id="email-error">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password">Hasło</label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && <p id="password-error">{errors.password.message}</p>}
        </div>
        {errors.root?.login && <p role="alert">{errors.root.login.message}</p>}
        <Button type="submit" disabled={isSubmitting || hasExistingSession}>
          {isSubmitting ? 'Logowanie…' : 'Zaloguj się'}
        </Button>
      </form>
      {hasExistingSession && (
        <>
          <p role="alert">{errors.root?.session?.message}</p>
          <Button
            type="button"
            disabled={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSuccess: () => clearErrors() })}
          >
            Zakończ sesję
          </Button>
          {logout.isError && <p role="alert">Nie udało się zakończyć sesji. Spróbuj ponownie.</p>}
        </>
      )}
    </main>
  )
}
