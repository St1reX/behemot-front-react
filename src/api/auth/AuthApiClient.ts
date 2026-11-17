import { isAxiosError } from 'axios'
import { apiHttp } from '@/api/http'
import type { LoginInput } from '@/types/auth/requests/auth.request.types'
import type { AuthUserResponse } from '@/types/auth/responses/auth.response.types'
import type { AppUser } from '@/types/globals/types/appUser.types'

export const authApiClient = {
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
