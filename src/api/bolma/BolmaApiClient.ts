import { apiHttp } from '@/api/http'
import type { BolmaIntegration, BolmaStatusResponse } from '@/types/bolma/bolma.types'

export const bolmaApiClient = {
  async getConfiguration(signal?: AbortSignal): Promise<BolmaIntegration> {
    const { data } = await apiHttp.get<BolmaIntegration>('/bolma/configuration', { signal, showErrorToast: false })
    return data
  },

  async getStatus(signal?: AbortSignal): Promise<BolmaStatusResponse> {
    const { data } = await apiHttp.get<BolmaStatusResponse>('/bolma/status', {
      signal,
      showErrorToast: false,
      validateStatus: (status) => status === 200 || status === 503,
    })

    return data
  },
}
