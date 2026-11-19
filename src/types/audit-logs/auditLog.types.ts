import type { Action } from '@/shared/constants/actions'
import type { Entity } from '@/shared/constants/entities'
import type { OperationStatus } from '@/shared/constants/operationStatuses'

export interface AuditLog {
  id: string
  userId: string
  username: string | null
  entityName: string
  entityId: string
  action: string
  operationStatus: OperationStatus
  comment: string | null
  sourceIp: string | null
  requestId: string | null
  isSuspicious: boolean
  suspiciousReason: string | null
  createdAt: string
}

export type AuditLogDetails = AuditLog & { dataBefore: unknown; dataAfter: unknown }

export interface AuditLogFilters {
  search?: string
  entityName?: Entity
  action?: Action
  operationStatus?: OperationStatus
  from?: string
  to?: string
}

export interface AuditLogPage {
  items: AuditLog[]
  total: number
  page: number
  pageSize: number
}
