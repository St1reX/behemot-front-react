import { apiHttp } from '@/api/http'
import type { ConnectionCheckResponse, MarketplaceIntegration } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'

export const marketplaceIntegrationApiClient = {
  async checkConnection(id: string): Promise<ConnectionCheckResponse> {
    const { data } = await apiHttp.post<ConnectionCheckResponse>(`/marketplace-integrations/${id}/check-status`, undefined, { showErrorToast: false, timeout: 90_000 })
    return data
  },

  async remove(id: string): Promise<void> {
    await apiHttp.delete(`/marketplace-integrations/${id}`, { showErrorToast: false })
  },

  async list(signal?: AbortSignal): Promise<MarketplaceIntegration[]> {
    const { data } = await apiHttp.get<MarketplaceIntegration[]>('/marketplace-integrations', { signal, showErrorToast: false })
    return data
  },
}
