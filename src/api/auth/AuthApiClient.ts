import { apiHttp } from '@/api/http'
import type { LoginInput, RegisterInput } from '@/types/auth/requests/auth.request.types'
import type { AuthUserResponse, VerifyAccountResponse } from '@/types/auth/responses/auth.response.types'
import type { AppUser } from '@/types/globals/types/appUser.types'

export const authApiClient = {
  async me(): Promise<AppUser> {
    const { data } = await apiHttp.get<AuthUserResponse>('/auth/me', {
      showErrorToast: false,
      redirectOnUnauthorized: false,
    })
    return data.user
  },

  async register(input: RegisterInput): Promise<void> {
    await apiHttp.post('/auth/register', input, { showErrorToast: false })
  },

  async verifyAccount(token: string): Promise<VerifyAccountResponse> {
    const { data } = await apiHttp.get<VerifyAccountResponse>('/auth/verify-account', {
      params: { token },
      showErrorToast: false,
      redirectOnUnauthorized: false,
    })
    return data
  },

  async login(input: LoginInput): Promise<AppUser> {
    const { data } = await apiHttp.post<AuthUserResponse>('/auth/login', input, {
      showErrorToast: false,
      redirectOnUnauthorized: false,
    })
    return data.user
  },

  async logout(): Promise<void> {
    await apiHttp.post('/auth/logout', undefined, {
      showErrorToast: false,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 401,
    })
  },
}
