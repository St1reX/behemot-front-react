import { apiHttp } from '@/api/http'
import type { Contractor } from '@/types/contractors/contractor.types'
import type { ContractorInput } from '@/types/contractors/contractor.schema'

export const contractorApiClient = {
  async list(signal?: AbortSignal): Promise<Contractor[]> {
    const { data } = await apiHttp.get<Contractor[]>('/contractor', { signal, showErrorToast: false })
    return data
  },
  async create(input: ContractorInput): Promise<Contractor> {
    const { data } = await apiHttp.post<Contractor>('/contractor', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: ContractorInput): Promise<Contractor> {
    const { data } = await apiHttp.put<Contractor>(`/contractor/${id}`, input, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/contractor/${id}`, { showErrorToast: false })
  },
}
