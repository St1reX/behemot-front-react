import { isAxiosError } from 'axios'
import { apiHttp } from '@/api/http'
import type { LoginInput, RegisterInput } from '@/types/auth/requests/auth.request.types'
import type { AuthUserResponse, VerifyAccountResponse } from '@/types/auth/responses/auth.response.types'
import type { AppUser } from '@/types/globals/types/appUser.types'

export const authApiClient = {
  async me(): Promise<AppUser | null> {
    try {
      const { data } = await apiHttp.get<AuthUserResponse>('/auth/me')
      return data.user
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        return null
      }

      throw error
    }
  },

  async register(input: RegisterInput): Promise<void> {
    await apiHttp.post('/auth/register', input)
  },

  async verifyAccount(token: string): Promise<VerifyAccountResponse> {
    const { data } = await apiHttp.get<VerifyAccountResponse>('/auth/verify-account', {
      params: { token },
    })
    return data
  },

  async login(input: LoginInput): Promise<AppUser> {
    const { data } = await apiHttp.post<AuthUserResponse>('/auth/login', input)
    return data.user
  },

  async logout(): Promise<void> {
    try {
      await apiHttp.post('/auth/logout')
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) {
        throw error
      }
    }
  },
}
