import { apiHttp } from '@/api/http'
import type { RoleInput } from '@/types/roles/role.schema'
import type { Role, RoleDetails, RolePrivilege } from '@/types/roles/role.types'

export const roleApiClient = {
  async list(signal?: AbortSignal): Promise<Role[]> {
    const { data } = await apiHttp.get<Role[]>('/role', { signal, showErrorToast: false })
    return data
  },
  async get(id: string, signal?: AbortSignal): Promise<RoleDetails> {
    const { data } = await apiHttp.get<RoleDetails>(`/role/${id}`, { signal, showErrorToast: false })
    return data
  },
  async privileges(signal?: AbortSignal): Promise<RolePrivilege[]> {
    const { data } = await apiHttp.get<RolePrivilege[]>('/role/privileges', { signal, showErrorToast: false })
    return data
  },
  async create(input: RoleInput): Promise<RoleDetails> {
    const { data } = await apiHttp.post<RoleDetails>('/role', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: RoleInput): Promise<RoleDetails> {
    const { data } = await apiHttp.put<RoleDetails>(`/role/${id}`, input, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/role/${id}`, { showErrorToast: false })
  },
}
