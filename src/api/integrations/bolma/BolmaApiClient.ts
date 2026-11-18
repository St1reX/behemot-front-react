import { apiHttp } from '@/api/http'
import { ApiError } from '@/api/errors'
import { bolmaStatusSchema } from '@/types/integrations/bolma/schemas/bolma.schema'
import type { BolmaStatusResponse } from '@/types/integrations/bolma/schemas/bolma.schema'

export const bolmaApiClient = {
  async getStatus(signal?: AbortSignal): Promise<BolmaStatusResponse> {
    const { data } = await apiHttp.get<unknown>('/integrations/bolma/status', {
      signal,
      showErrorToast: false,
      validateStatus: (status) => status === 200 || status === 503,
    })

    const result = bolmaStatusSchema.safeParse(data)
    if (!result.success) {
      throw new ApiError('Serwer zwrócił nieprawidłową odpowiedź statusu Bolmy.', { cause: result.error })
    }
    return result.data
  },
}
