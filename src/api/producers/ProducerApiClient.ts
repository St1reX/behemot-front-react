import { apiHttp } from '@/api/http'
import type { Producer } from '@/types/producers/producer.types'
import type { ProducerInput } from '@/types/producers/producer.schema'

export const producerApiClient = {
  async list(signal?: AbortSignal): Promise<Producer[]> {
    const { data } = await apiHttp.get<Producer[]>('/producer', { signal, showErrorToast: false })
    return data
  },
  async create(input: ProducerInput): Promise<Producer> {
    const { data } = await apiHttp.post<Producer>('/producer', input, { showErrorToast: false })
    return data
  },
  async update(id: string, input: ProducerInput): Promise<Producer> {
    const { data } = await apiHttp.put<Producer>(`/producer/${id}`, input, { showErrorToast: false })
    return data
  },
  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/producer/${id}`, { showErrorToast: false })
  },
}
