import { apiHttp } from '@/api/http'
import type { ErliConfigurationInput } from '@/types/integrations/erli/erli.schema'
import type { MarketplaceIntegration } from '@/types/integrations/integration.types'

export const erliApiClient = {
  async createConfiguration(input: ErliConfigurationInput): Promise<MarketplaceIntegration> {
    const { data } = await apiHttp.post<MarketplaceIntegration>('/integrations/marketplace/ERLI', input, { showErrorToast: false })
    return data
  },
}
