import { isAxiosError } from 'axios'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'
import { AuthLayout } from './components/AuthLayout'
import { useVerifyAccount } from './hooks/useVerifyAccount'

export function VerifyAccountPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')?.trim() || null

  return <VerifyAccountResult key={token} token={token} />
}

function VerifyAccountResult({ token }: { token: string | null }) {
  const verification = useVerifyAccount(token)
  const status = isAxiosError(verification.error) ? verification.error.response?.status : undefined
  const isInvalidToken = status === 400 || status === 422
  const isVerifying = Boolean(token) && (verification.isIdle || verification.isPending)

  let errorMessage = 'Nie udało się potwierdzić weryfikacji. Spróbuj ponownie. Jeśli konto zostało już aktywowane, możesz się zalogować.'

  if (isInvalidToken) {
    errorMessage = 'Link aktywacyjny jest nieprawidłowy, wygasł lub został już wykorzystany. Jeśli konto zostało wcześniej aktywowane, możesz się zalogować.'
  } else if (status === 429) {
    errorMessage = 'Zbyt wiele prób weryfikacji. Spróbuj ponownie później.'
  }

  return (
    <AuthLayout title="Weryfikacja konta" description="Potwierdzenie adresu e-mail w Behemocie.">
      <div className="grid gap-4 text-center" aria-busy={isVerifying}>
        {!token ? (
          <p role="alert" className="text-destructive">
            W linku brakuje tokenu weryfikacyjnego. Otwórz pełny link z wiadomości e-mail.
          </p>
        ) : verification.isSuccess ? (
          <p role="status">Konto zostało aktywowane. Możesz się teraz zalogować.</p>
        ) : verification.isError ? (
          <>
            <p role="alert" className="text-destructive">{errorMessage}</p>
            {!isInvalidToken && (
              <Button type="button" variant="outline" onClick={() => verification.mutate(token)}>
                Spróbuj ponownie
              </Button>
            )}
          </>
        ) : (
          <p role="status">Trwa weryfikacja konta…</p>
        )}
        {!isVerifying && (
          <Link className="text-primary underline-offset-4 hover:underline" to="/login">
            Przejdź do logowania
          </Link>
        )}
      </div>
    </AuthLayout>
  )
}
