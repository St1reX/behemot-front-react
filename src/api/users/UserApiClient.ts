import { apiHttp } from '@/api/http'
import type { UserInput } from '@/types/users/user.schema'
import type { ManagedUser, UserFormOptions } from '@/types/users/user.types'

export const userApiClient = {
  async list(signal?: AbortSignal): Promise<ManagedUser[]> {
    const { data } = await apiHttp.get<ManagedUser[]>('/user', { signal, showErrorToast: false })
    return data
  },
  async formOptions(signal?: AbortSignal): Promise<UserFormOptions> {
    const { data } = await apiHttp.get<UserFormOptions>('/user/form-options', { signal, showErrorToast: false })
    return data
  },
  async create(input: UserInput): Promise<ManagedUser> {
    const { data } = await apiHttp.post<ManagedUser>('/user', { ...input, departmentId: input.departmentId || null }, { showErrorToast: false })
    return data
  },
  async update(id: string, { password: _password, ...input }: UserInput): Promise<ManagedUser> {
    const { data } = await apiHttp.put<ManagedUser>(`/user/${id}`, { ...input, departmentId: input.departmentId || null }, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/user/${id}`, { showErrorToast: false })
  },
}
