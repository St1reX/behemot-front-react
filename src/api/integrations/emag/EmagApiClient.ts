import { apiHttp } from '@/api/http'
import type { EmagConfigurationInput, EmagConnectionResponse } from '@/types/integrations/emag/emag.schema'

export const emagApiClient = {
  async createConfiguration(input: EmagConfigurationInput): Promise<EmagConnectionResponse> {
    const { data } = await apiHttp.post<EmagConnectionResponse>('/integrations/marketplace/EMAG', input, { showErrorToast: false, timeout: 60_000 })
    return data
  },
}
