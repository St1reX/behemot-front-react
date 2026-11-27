export const MARKETPLACE_INTEGRATION_CHANNELS = {
  ALLEGRO: 'ALLEGRO',
  EMAG: 'EMAG',
  ERLI: 'ERLI',
  PRESTASHOP: 'PRESTASHOP',
} as const

export type MarketplaceIntegrationChannel = (typeof MARKETPLACE_INTEGRATION_CHANNELS)[keyof typeof MARKETPLACE_INTEGRATION_CHANNELS]

export const INTEGRATION_ENVIRONMENTS = {
  PRODUCTION: 'PRODUCTION',
  SANDBOX: 'SANDBOX',
} as const

export type IntegrationEnvironment = (typeof INTEGRATION_ENVIRONMENTS)[keyof typeof INTEGRATION_ENVIRONMENTS]

export const MARKETPLACE_INTEGRATION_STATUSES = {
  PENDING: 'PENDING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
} as const

export type MarketplaceIntegrationStatus = (typeof MARKETPLACE_INTEGRATION_STATUSES)[keyof typeof MARKETPLACE_INTEGRATION_STATUSES]

export const MARKETPLACE_INTEGRATION_CHANNEL_LABELS: Record<MarketplaceIntegrationChannel, string> = {
  ALLEGRO: 'Allegro',
  EMAG: 'eMAG',
  ERLI: 'ERLI',
  PRESTASHOP: 'PrestaShop',
}

export const MARKETPLACE_INTEGRATION_STATUS_LABELS: Record<MarketplaceIntegrationStatus, string> = {
  PENDING: 'Oczekuje na połączenie',
  CONNECTED: 'Połączono',
  ERROR: 'Błąd połączenia',
}

export const MARKETPLACE_INTEGRATION_STATUS_CLASSES: Record<MarketplaceIntegrationStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONNECTED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ERROR: 'bg-destructive/10 text-destructive',
}
