import { apiHttp } from '@/api/http'
import type { AuditLogDetails, AuditLogFilters, AuditLogPage } from '@/types/audit-logs/auditLog.types'

export const auditLogApiClient = {
  async list(params: AuditLogFilters & { page?: number; pageSize?: number }, signal?: AbortSignal): Promise<AuditLogPage> {
    const { data } = await apiHttp.get<AuditLogPage>('/audit-log', { params, signal, showErrorToast: false })
    return data
  },
  async get(id: string, signal?: AbortSignal): Promise<AuditLogDetails> {
    const { data } = await apiHttp.get<AuditLogDetails>(`/audit-log/${id}`, { signal, showErrorToast: false })
    return data
  },
}
