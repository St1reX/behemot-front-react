import { apiHttp } from '@/api/http'
import type { MarketplaceIntegration } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'
import type { PrestashopConfigurationInput } from '@/types/marketplaceIntegrations/prestashop/prestashop.schema'

export const prestashopApiClient = {
  async createConfiguration(input: PrestashopConfigurationInput): Promise<MarketplaceIntegration> {
    const { data } = await apiHttp.post<MarketplaceIntegration>('/marketplace-integrations/PRESTASHOP', input, { showErrorToast: false })
    return data
  },
}
