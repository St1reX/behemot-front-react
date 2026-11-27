export const INTEGRATION_SYNC_STATUSES = {
  PENDING: 'PENDING',
  SYNCED: 'SYNCED',
  FAILED: 'FAILED',
} as const

export type IntegrationSyncStatus = (typeof INTEGRATION_SYNC_STATUSES)[keyof typeof INTEGRATION_SYNC_STATUSES]
