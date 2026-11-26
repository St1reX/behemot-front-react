import { apiHttp } from '@/api/http'
import type { ConnectionCheckResponse, IntegrationsResponse } from '@/types/integrations/integration.types'

export const integrationApiClient = {
  async checkConnection(id: string): Promise<ConnectionCheckResponse> {
    const { data } = await apiHttp.post<ConnectionCheckResponse>(`/integrations/marketplace/${id}/check-status`, undefined, { showErrorToast: false, timeout: 90_000 })
    return data
  },

  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/integrations/marketplace/${id}`, { showErrorToast: false })
  },

  async list(signal?: AbortSignal): Promise<IntegrationsResponse> {
    const { data } = await apiHttp.get<IntegrationsResponse>('/integrations', { signal, showErrorToast: false })
    return data
  },
}
