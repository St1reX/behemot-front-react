export type MarketplaceIntegrationChannel = 'ALLEGRO' | 'EMAG' | 'ERLI' | 'PRESTASHOP'
export type IntegrationEnvironment = 'PRODUCTION' | 'SANDBOX'
export type MarketplaceIntegrationStatus = 'PENDING' | 'CONNECTED' | 'ERROR'

export interface MarketplaceIntegration {
  id: string
  name: string
  channel: MarketplaceIntegrationChannel
  baseUrl: string | null
  externalAccountId: string | null
  externalUsername: string | null
  environment: IntegrationEnvironment
  market: string | null
  isEnabled: boolean
  status: MarketplaceIntegrationStatus
  accessTokenExpiresAt: string | null
  lastConnectionCheckAt: string | null
  lastSuccessfulSyncAt: string | null
  lastErrorAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ConnectionCheckResponse {
  integration: MarketplaceIntegration
  error: string | null
}
