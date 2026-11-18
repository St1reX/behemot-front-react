import type { AppUser } from '@/types/globals/types/appUser.types'

export type AuthUserResponse = {
  user: AppUser
}

export type VerifyAccountResponse = {
  message: string
}
