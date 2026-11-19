import { OPERATION_STATUS_CLASSES, OPERATION_STATUS_LABELS } from '@/shared/constants/operationStatuses'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, History, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Link } from 'react-router'
import { auditLogApiClient } from '@/api/audit-logs/AuditLogApiClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccess } from '@/hooks/useAccess'
import { formatAuditDate } from '@/pages/audit-logs/auditLog.utils'
import { ACTIONS, getActionLabel } from '@/shared/constants/actions'
import { ENTITIES, getEntityLabel } from '@/shared/constants/entities'

const RECENT_ACTIVITY_LIMIT = 5
const activityIcons = { CREATE: Plus, UPDATE: Pencil, DELETE: Trash2, READ: History }

export function RecentActivityCard() {
  const { requirePrivilege } = useAccess()
  const canRead = requirePrivilege(`${ENTITIES.AUDIT_LOG}:${ACTIONS.READ}`)
  const query = useQuery({
    queryKey: ['audit-logs', 'recent'],
    queryFn: ({ signal }) => auditLogApiClient.list({ page: 1, pageSize: RECENT_ACTIVITY_LIMIT }, signal),
    enabled: canRead,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: false,
  })

  return (
    <Card className="gap-0 shadow-none @4xl/dashboard:col-span-3 [--card-spacing:--spacing(5)]">
      <CardHeader className="flex items-center justify-between gap-3 pb-4">
        <div><h2 className="text-base font-semibold tracking-normal">Ostatnia aktywność</h2><p className="mt-1 text-xs text-muted-foreground">Ostatnie {RECENT_ACTIVITY_LIMIT} operacji w systemie</p></div>
        {canRead && <Button type="button" variant="ghost" size="icon-sm" aria-label="Odśwież aktywność" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw aria-hidden="true" className={query.isFetching ? 'animate-spin motion-reduce:animate-none' : undefined} /></Button>}
      </CardHeader>
      <CardContent>
        {!canRead ? <p className="py-5 text-sm text-muted-foreground">Nie masz uprawnień do przeglądania historii operacji.</p>
          : query.error ? <p role="alert" className="py-5 text-sm text-destructive">{query.error.message} Ponów odczyt przyciskiem odświeżania.</p>
          : query.isPending ? <div role="status" className="space-y-4 py-2"><span className="sr-only">Wczytywanie aktywności…</span>{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} aria-hidden="true" className="h-16 w-full" />)}</div>
          : query.data.items.length === 0 ? <div className="grid justify-items-center gap-3 py-10 text-center"><History aria-hidden="true" className="size-8 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Nie zarejestrowano jeszcze żadnej aktywności.</p></div>
          : <ol className="divide-y">{query.data.items.slice(0, RECENT_ACTIVITY_LIMIT).map((log) => {
            const Icon = activityIcons[log.action as keyof typeof activityIcons] ?? History
            return (
              <li key={log.id}>
                <Link to={`/audit-logs?log=${log.id}`} className="group -mx-2 flex gap-3 rounded-lg px-2 py-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary/8 text-primary"><Icon aria-hidden="true" className="size-3.5" /></span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium group-hover:underline">{getActionLabel(log.action)} · {getEntityLabel(log.entityName)}</p>
                    <p className="truncate text-xs text-muted-foreground">{log.username ?? log.userId}{log.comment ? ` · ${log.comment}` : ''}</p>
                    <div className="flex flex-wrap items-center gap-2"><time dateTime={log.createdAt} className="text-xs text-muted-foreground">{formatAuditDate(log.createdAt)}</time><span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${OPERATION_STATUS_CLASSES[log.operationStatus]}`}>{OPERATION_STATUS_LABELS[log.operationStatus]}</span></div>
                  </div>
                </Link>
              </li>
            )
          })}</ol>}
        {canRead && <Link to="/audit-logs" className="mt-3 flex items-center justify-between gap-2 border-t pt-4 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">Zobacz pełną historię<ArrowRight aria-hidden="true" className="size-4" /></Link>}
      </CardContent>
    </Card>
  )
}
