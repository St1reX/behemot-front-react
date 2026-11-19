import { apiHttp } from '@/api/http'
import type { Department } from '@/types/departments/department.types'

export const departmentApiClient = {
  async list(signal?: AbortSignal): Promise<Department[]> {
    const { data } = await apiHttp.get<Department[]>('/department', { signal, showErrorToast: false })
    return data
  },
}
