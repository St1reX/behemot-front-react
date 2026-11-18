import { create } from 'zustand'
import type { AppUser } from '@/types/globals/types/appUser.types'

interface AuthState {
  user: AppUser | null
  currentUserLoaded: boolean
  setUser: (user: AppUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  currentUserLoaded: false,
  setUser: (user) => set({ user, currentUserLoaded: true }),
}))
