import { apiHttp } from '@/api/http'
import type { IntegrationsResponse } from '@/types/integrations/integration.types'

export const integrationApiClient = {
  async list(signal?: AbortSignal): Promise<IntegrationsResponse> {
    const { data } = await apiHttp.get<IntegrationsResponse>('/integrations', { signal, showErrorToast: false })
    return data
  },
}
