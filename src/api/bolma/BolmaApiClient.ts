import { apiHttp } from '@/api/http'
import type { BolmaIntegration } from '@/types/bolma/bolma.types'
import { ApiError } from '@/api/errors'
import { bolmaStatusSchema } from '@/types/bolma/schemas/bolma.schema'
import type { BolmaStatusResponse } from '@/types/bolma/schemas/bolma.schema'

export const bolmaApiClient = {
  async getConfiguration(signal?: AbortSignal): Promise<BolmaIntegration> {
    const { data } = await apiHttp.get<BolmaIntegration>('/bolma/configuration', { signal, showErrorToast: false })
    return data
  },

  async getStatus(signal?: AbortSignal): Promise<BolmaStatusResponse> {
    const { data } = await apiHttp.get<unknown>('/bolma/status', {
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
