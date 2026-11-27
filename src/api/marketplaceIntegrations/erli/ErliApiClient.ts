import { apiHttp } from '@/api/http'
import type { ErliConfigurationInput } from '@/types/marketplaceIntegrations/erli/erli.schema'
import type { MarketplaceIntegration } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'

export const erliApiClient = {
  async createConfiguration(input: ErliConfigurationInput): Promise<MarketplaceIntegration> {
    const { data } = await apiHttp.post<MarketplaceIntegration>('/marketplace-integrations/ERLI', input, { showErrorToast: false })
    return data
  },
}
