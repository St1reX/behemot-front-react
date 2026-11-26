import { apiHttp } from '@/api/http'
import type { MarketplaceIntegration } from '@/types/integrations/integration.types'
import type { PrestashopConfigurationInput } from '@/types/integrations/prestashop/prestashop.schema'

export const prestashopApiClient = {
  async createConfiguration(input: PrestashopConfigurationInput): Promise<MarketplaceIntegration> {
    const { data } = await apiHttp.post<MarketplaceIntegration>('/integrations/marketplace/PRESTASHOP', input, { showErrorToast: false })
    return data
  },
}
