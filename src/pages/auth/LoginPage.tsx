import { LockKeyhole, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from './components/AuthLayout';
import { useLoginForm } from './hooks/useLoginForm';

export function LoginPage() {
   const { register, errors, isSubmitting, submit, logout, endSession } = useLoginForm();
   const hasExistingSession = Boolean(errors.root?.session);

   return (
      <AuthLayout title="Witaj ponownie" description="Zaloguj się do swojego konta w Behemocie.">
         <form
            aria-label="Logowanie do Behemota"
            className="grid gap-4"
            noValidate
            onSubmit={
               hasExistingSession || isSubmitting ? (event) => event.preventDefault() : submit
            }
         >
            <div className="grid gap-1.5">
               <label className="sr-only" htmlFor="email">
                  Adres e-mail
               </label>
               <div className="relative">
                  <Mail
                     aria-hidden="true"
                     className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                     id="email"
                     type="email"
                     autoComplete="username"
                     placeholder="Adres e-mail"
                     required
                     className="h-12 bg-background pl-10"
                     aria-invalid={Boolean(errors.email)}
                     aria-describedby={errors.email ? 'email-error' : undefined}
                     {...register('email')}
                  />
               </div>
               {errors.email && (
                  <p id="email-error" className="text-destructive">
                     {errors.email.message}
                  </p>
               )}
            </div>
            <div className="grid gap-1.5">
               <label className="sr-only" htmlFor="password">
                  Hasło
               </label>
               <div className="relative">
                  <LockKeyhole
                     aria-hidden="true"
                     className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                     id="password"
                     type="password"
                     autoComplete="current-password"
                     placeholder="Hasło"
                     required
                     className="h-12 bg-background pl-10"
                     aria-invalid={Boolean(errors.password)}
                     aria-describedby={errors.password ? 'password-error' : undefined}
                     {...register('password')}
                  />
               </div>
               {errors.password && (
                  <p id="password-error" className="text-destructive">
                     {errors.password.message}
                  </p>
               )}
            </div>
            {errors.root?.login && (
               <p role="alert" className="text-destructive">
                  {errors.root.login.message}
               </p>
            )}
            <Button
               className="mt-2 h-11 w-full shadow-sm"
               type="submit"
               disabled={isSubmitting || hasExistingSession}
            >
               {isSubmitting ? 'Logowanie…' : 'Zaloguj się'}
            </Button>
         </form>

         {hasExistingSession && (
            <div className="mt-4 grid gap-3 rounded-lg border border-border bg-muted p-3">
               <p role="alert">{errors.root?.session?.message}</p>
               <Button
                  type="button"
                  variant="outline"
                  disabled={logout.isPending}
                  onClick={endSession}
               >
                  {logout.isPending ? 'Kończenie sesji…' : 'Zakończ sesję'}
               </Button>
               {logout.isError && (
                  <p role="alert" className="text-destructive">
                     Nie udało się zakończyć sesji. Spróbuj ponownie.
                  </p>
               )}
            </div>
         )}
         <p className="mt-6 text-center text-sm text-muted-foreground">
            Nie masz konta?{' '}
            <Link className="text-primary underline-offset-4 hover:underline" to="/register">
               Zarejestruj się
            </Link>
         </p>
      </AuthLayout>
   );
}
