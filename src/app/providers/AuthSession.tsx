import { useEffect, type PropsWithChildren } from 'react'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAuthStore } from '@/stores/auth.store'

export function AuthSession({ children }: PropsWithChildren) {
  const currentUserLoaded = useAuthStore((state) => state.currentUserLoaded)
  const setUser = useAuthStore((state) => state.setUser)
  const currentUser = useCurrentUser(!currentUserLoaded)

  useEffect(() => {
    if (!currentUserLoaded && currentUser.isSuccess) {
      setUser(currentUser.data)
    }
  }, [currentUserLoaded, currentUser.isSuccess, currentUser.data, setUser])

  if (currentUserLoaded) {
    return children
  }

  return (
    <main className="grid min-h-dvh place-content-center gap-4 px-4 text-center">
      {currentUser.isError ? (
        <>
          <p role="alert">Nie udało się sprawdzić sesji. Spróbuj ponownie.</p>
          <Button type="button" onClick={() => void currentUser.refetch()}>
            Spróbuj ponownie
          </Button>
        </>
      ) : (
        <p role="status">Sprawdzanie sesji…</p>
      )}
    </main>
  )
}
