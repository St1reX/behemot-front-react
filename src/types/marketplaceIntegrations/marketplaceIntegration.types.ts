import type { IntegrationEnvironment, MarketplaceIntegrationChannel, MarketplaceIntegrationStatus } from '@/shared/constants/marketplaceIntegrations'

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
