import { apiHttp } from '@/api/http'
import { bolmaStatusSchema } from '@/types/integrations/bolma/schemas/bolma.schema'
import type { BolmaStatusResponse } from '@/types/integrations/bolma/schemas/bolma.schema'

export const bolmaApiClient = {
  async getStatus(signal?: AbortSignal): Promise<BolmaStatusResponse> {
    const { data } = await apiHttp.get<unknown>('/integrations/bolma/status', {
      signal,
      validateStatus: (status) => status === 200 || status === 503,
    })

    return bolmaStatusSchema.parse(data)
  },
}
