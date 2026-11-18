import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthLayout } from './components/AuthLayout'
import { useRegisterForm } from './hooks/useRegisterForm'

export function RegisterPage() {
  const { register, errors, isSubmitting, isRegistered, submit } = useRegisterForm()

  return (
    <AuthLayout title="Utwórz konto" description="Zarejestruj swoje konto w Behemocie.">
      {isRegistered ? (
        <p role="status" className="text-center">
          Konto zostało utworzone. Sprawdź skrzynkę e-mail i kliknij link aktywacyjny przed
          zalogowaniem.
        </p>
      ) : (
        <form
          aria-label="Rejestracja w Behemocie"
          className="grid gap-4"
          noValidate
          onSubmit={isSubmitting ? (event) => event.preventDefault() : submit}
        >
          <div className="grid gap-1.5">
            <label className="sr-only" htmlFor="username">Nazwa użytkownika</label>
            <div className="relative">
              <UserRound
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="Nazwa użytkownika"
                required
                minLength={3}
                maxLength={25}
                className="h-12 bg-background pl-10"
                aria-invalid={Boolean(errors.username)}
                aria-describedby={errors.username ? 'username-error' : undefined}
                {...register('username')}
              />
            </div>
            {errors.username && (
              <p id="username-error" className="text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <label className="sr-only" htmlFor="email">Adres e-mail</label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Adres e-mail"
                required
                className="h-12 bg-background pl-10"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-1.5">
            <label className="sr-only" htmlFor="password">Hasło</label>
            <div className="relative">
              <LockKeyhole
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Hasło"
                required
                minLength={8}
                className="h-12 bg-background pl-10"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p id="password-error" className="text-destructive">{errors.password.message}</p>
            )}
          </div>
          {errors.root?.register && (
            <p role="alert" className="text-destructive">{errors.root.register.message}</p>
          )}
          <Button className="mt-2 h-11 w-full shadow-sm" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Rejestrowanie…' : 'Zarejestruj się'}
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Masz już konto?{' '}
        <Link className="text-primary underline-offset-4 hover:underline" to="/login">
          Zaloguj się
        </Link>
      </p>
    </AuthLayout>
  )
}
