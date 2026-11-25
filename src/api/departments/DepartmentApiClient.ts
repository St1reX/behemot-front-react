import { apiHttp } from '@/api/http'
import type { Department } from '@/types/departments/department.types'
import type { DepartmentInput } from '@/types/departments/department.schema'

export const departmentApiClient = {
  async list(signal?: AbortSignal): Promise<Department[]> {
    const { data } = await apiHttp.get<Department[]>('/department', { signal, showErrorToast: false })
    return data
  },
  async create(input: DepartmentInput): Promise<Department> {
    const { data } = await apiHttp.post<Department>('/department', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: DepartmentInput): Promise<Department> {
    const { data } = await apiHttp.put<Department>(`/department/${id}`, input, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/department/${id}`, { showErrorToast: false })
  },
}
