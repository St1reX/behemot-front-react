import { apiHttp } from '@/api/http'
import type { AllegroAuthorizationInput } from '@/types/marketplaceIntegrations/allegro/allegro.schema'

export const allegroApiClient = {
  async getConfiguration(signal?: AbortSignal) {
    const { data } = await apiHttp.get<{ callbackUrl: string }>('/marketplace-integrations/allegro/configuration', { signal, showErrorToast: false })
    return data
  },

  async authorize(input: AllegroAuthorizationInput) {
    const { data } = await apiHttp.post<{ authorizationUrl: string }>('/marketplace-integrations/allegro/authorize', input, { showErrorToast: false })
    return data
  },
}
