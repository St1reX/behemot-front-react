import type { MarketplaceIntegrationStatus } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'

export const STATUS_LABELS: Record<MarketplaceIntegrationStatus, string> = {
  PENDING: 'Oczekuje na połączenie',
  CONNECTED: 'Połączono',
  ERROR: 'Błąd połączenia',
}

export const STATUS_CLASSES: Record<MarketplaceIntegrationStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  CONNECTED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  ERROR: 'bg-destructive/10 text-destructive',
}
