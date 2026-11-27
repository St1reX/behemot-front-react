import { apiHttp } from '@/api/http'
import type { EmagConfigurationInput } from '@/types/marketplaceIntegrations/emag/emag.schema'
import type { MarketplaceIntegration } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'

export const emagApiClient = {
  async createConfiguration(input: EmagConfigurationInput): Promise<MarketplaceIntegration> {
    const { data } = await apiHttp.post<MarketplaceIntegration>('/marketplace-integrations/EMAG', input, { showErrorToast: false })
    return data
  },
}
