import { isAxiosError } from 'axios'
import { create } from 'zustand'
import { authApiClient } from '@/api/auth/AuthApiClient'
import type { AppUser } from '@/types/globals/types/appUser.types'

interface AuthState {
  user: AppUser | null
  sessionInitialized: boolean
  sessionError: Error | null
  setUser: (user: AppUser | null) => void
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  let pendingRequest: Promise<void> | null = null
  let sessionVersion = 0

  return {
    user: null,
    sessionInitialized: false,
    sessionError: null,
    setUser: (user) => {
      sessionVersion += 1
      set({ user, sessionInitialized: true, sessionError: null })
    },
    refreshSession: () => {
      if (pendingRequest) {
        return pendingRequest
      }

      const requestVersion = sessionVersion

      pendingRequest = authApiClient.me()
        .then(
          (user) => {
            // A session check must not overwrite a later login or logout.
            if (requestVersion === sessionVersion) {
              set({ user, sessionInitialized: true, sessionError: null })
            }
          },
          (error: unknown) => {
            if (requestVersion !== sessionVersion) {
              return
            }

            if (isAxiosError(error) && error.response?.status === 401) {
              set({ user: null, sessionInitialized: true, sessionError: null })
              return
            }

            set({
              sessionInitialized: true,
              sessionError: error instanceof Error
                ? error
                : new Error('Nie udało się sprawdzić sesji.', { cause: error }),
            })
          },
        )
        .finally(() => {
          pendingRequest = null
        })

      return pendingRequest
    },
  }
})
