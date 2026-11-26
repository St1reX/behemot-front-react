import { apiHttp } from '@/api/http'
import type { EmagConfigurationInput } from '@/types/integrations/emag/emag.schema'
import type { MarketplaceIntegration } from '@/types/integrations/integration.types'

export const emagApiClient = {
  async createConfiguration(input: EmagConfigurationInput): Promise<MarketplaceIntegration> {
    const { data } = await apiHttp.post<MarketplaceIntegration>('/integrations/marketplace/EMAG', input, { showErrorToast: false })
    return data
  },
}
