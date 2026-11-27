export const OPERATION_STATUSES = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
} as const

export type OperationStatus = (typeof OPERATION_STATUSES)[keyof typeof OPERATION_STATUSES]

export const OPERATION_STATUS_LABELS: Record<OperationStatus, string> = {
  SUCCESS: 'Sukces',
  FAILED: 'Błąd',
  PENDING: 'W toku',
}

export const OPERATION_STATUS_CLASSES: Record<OperationStatus, string> = {
  SUCCESS: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  FAILED: 'bg-destructive/10 text-destructive',
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
}
