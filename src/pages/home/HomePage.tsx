import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/useLogout'
import { useAuthStore } from '@/stores/auth.store'

export function HomePage() {
  const username = useAuthStore((state) => state.user?.username)
  const logout = useLogout()

  return (
    <main>
      <h1>Behemot</h1>
      <p>Zalogowano jako {username}</p>
      <Button type="button" disabled={logout.isPending} onClick={() => logout.mutate()}>
        {logout.isPending ? 'Wylogowywanie…' : 'Wyloguj się'}
      </Button>
      {logout.isError && <p role="alert">Nie udało się wylogować. Spróbuj ponownie.</p>}
    </main>
  )
}
