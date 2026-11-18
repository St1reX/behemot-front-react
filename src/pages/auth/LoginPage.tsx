import { Image, LockKeyhole, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoginBackdrop } from './components/LoginBackdrop';
import { useLoginForm } from './hooks/useLoginForm';
import './login.css';

export function LoginPage() {
   const { register, errors, isSubmitting, submit, logout, endSession } = useLoginForm();
   const hasExistingSession = Boolean(errors.root?.session);

   return (
      <main className="login-page relative isolate grid min-h-dvh place-items-center bg-background px-4 py-8 font-sans">
         <LoginBackdrop />
         <Card className="relative w-full max-w-(--login-card-width) gap-9 py-7 shadow-lg ring-border sm:[--card-spacing:--spacing(7)]">
            <CardHeader className="justify-items-center gap-2 text-center">
               <div className="login-logo mb-5 flex items-center gap-3" aria-hidden="true">
                  <span className="grid size-15 place-items-center rounded-xl border border-border bg-accent text-accent-foreground shadow-sm">
                     <Image className="size-7" strokeWidth={1.5} />
                  </span>
               </div>
               <h1 className="text-[1.75rem] leading-tight font-semibold">Witaj ponownie</h1>
               <CardDescription className="text-secondary-foreground">
                  Zaloguj się do swojego konta w Behemocie.
               </CardDescription>
            </CardHeader>

            <CardContent>
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
            </CardContent>
         </Card>
      </main>
   );
}
