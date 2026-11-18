import { useQueryClient } from '@tanstack/react-query'
import { useEffect, type PropsWithChildren } from 'react'
import { useAuthStore } from '@/stores/auth.store'

export function AuthSession({ children }: PropsWithChildren) {
  const queryClient = useQueryClient()
  const sessionInitialized = useAuthStore((state) => state.sessionInitialized)
  const refreshSession = useAuthStore((state) => state.refreshSession)

  useEffect(() => {
    return useAuthStore.subscribe((state, previousState) => {
      if (previousState.user && previousState.user.id !== state.user?.id) {
        queryClient.removeQueries()
      }
    })
  }, [queryClient])

  useEffect(() => {
    function checkSession() {
      if (document.visibilityState === 'visible') {
        void refreshSession()
      }
    }

    void refreshSession()
    document.addEventListener('visibilitychange', checkSession)
    window.addEventListener('online', checkSession)

    return () => {
      document.removeEventListener('visibilitychange', checkSession)
      window.removeEventListener('online', checkSession)
    }
  }, [refreshSession])

  if (!sessionInitialized) {
    return (
      <main className="grid min-h-dvh place-content-center px-4 text-center">
        <p role="status">Sprawdzanie sesji…</p>
      </main>
    )
  }

  return children
}
