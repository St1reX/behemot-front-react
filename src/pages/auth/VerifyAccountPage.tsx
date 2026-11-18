import { Link, useSearchParams } from 'react-router'
import { ApiError } from '@/api/errors'
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
  const status = verification.error instanceof ApiError ? verification.error.status : undefined
  const isInvalidToken = status === 400 || status === 422
  const isVerifying = Boolean(token) && (verification.isIdle || verification.isPending)

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
            <p role="alert" className="text-destructive">{verification.error.message}</p>
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
