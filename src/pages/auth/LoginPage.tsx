import { LockKeyhole, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { FormActions } from '@/components/common/FormActions';
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
               <label className="sr-only" htmlFor="username">
                  Nazwa użytkownika
               </label>
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
                     className="h-12 bg-background pl-10"
                     aria-invalid={Boolean(errors.username)}
                     aria-describedby={errors.username ? 'username-error' : undefined}
                     {...register('username')}
                  />
               </div>
               {errors.username && (
                  <p id="username-error" className="text-destructive">
                     {errors.username.message}
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
            <FormActions layout="inline" className="block" isPending={isSubmitting}
               submitLabel="Zaloguj się" pendingLabel="Logowanie…" submitDisabled={hasExistingSession}
               submitProps={{ className: 'mt-2 h-11 w-full shadow-sm' }} />
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
                     {logout.error.message}
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
