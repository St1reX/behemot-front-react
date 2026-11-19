import { getActionLabel } from '@/shared/constants/actions'
import { getEntityLabel } from '@/shared/constants/entities'
import { OPERATION_STATUS_CLASSES, OPERATION_STATUS_LABELS } from '@/shared/constants/operationStatuses'
import { useQuery } from '@tanstack/react-query'
import { auditLogApiClient } from '@/api/audit-logs/AuditLogApiClient'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAuditDate } from '../auditLog.utils'

export function AuditLogDetailsDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const query = useQuery({
    queryKey: ['audit-logs', 'detail', id],
    queryFn: ({ signal }) => auditLogApiClient.get(id, signal),
    retry: false,
  })
  const log = query.data

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto font-sans sm:max-w-4xl">
        <DialogHeader className="pr-8">
          <DialogTitle>Szczegóły operacji</DialogTitle>
          <DialogDescription>Informacje o zdarzeniu oraz dane przed zmianą i po zmianie.</DialogDescription>
        </DialogHeader>
        {query.isPending ? <div role="status"><span className="sr-only">Wczytywanie wpisu…</span><Skeleton aria-hidden="true" className="h-48 w-full" /></div> : query.error ? (
          <div role="alert" className="space-y-3"><p className="text-sm text-destructive">{query.error.message}</p><Button variant="outline" onClick={() => void query.refetch()}>Spróbuj ponownie</Button></div>
        ) : log && (
          <div className="min-w-0 space-y-5">
            <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-medium">{getActionLabel(log.action)} · {getEntityLabel(log.entityName)}</span><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OPERATION_STATUS_CLASSES[log.operationStatus]}`}>{OPERATION_STATUS_LABELS[log.operationStatus]}</span></div>
            <dl className="grid gap-4 rounded-lg border bg-muted/20 p-4 text-sm sm:grid-cols-2 [&_dt]:mb-1 [&_dt]:text-xs [&_dt]:text-muted-foreground [&_dd]:wrap-anywhere">
              <div><dt>Data</dt><dd>{formatAuditDate(log.createdAt)}</dd></div>
              <div><dt>Użytkownik</dt><dd>{log.username ?? log.userId}</dd></div>
              <div><dt>ID rekordu</dt><dd className="font-mono text-xs">{log.entityId}</dd></div>
              <div><dt>ID użytkownika</dt><dd className="font-mono text-xs">{log.userId}</dd></div>
              <div><dt>Adres IP</dt><dd>{log.sourceIp ?? '—'}</dd></div>
              <div><dt>ID żądania</dt><dd className="font-mono text-xs">{log.requestId ?? '—'}</dd></div>
              <div><dt>ID wpisu</dt><dd className="font-mono text-xs">{log.id}</dd></div>
            </dl>
            {log.comment && <p className="text-sm wrap-anywhere">{log.comment}</p>}
            {log.isSuspicious && <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm">Do sprawdzenia: {log.suspiciousReason ?? 'Wpis oznaczony przez mechanizm audytu.'}</p>}
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              {[{ label: 'Przed zmianą', data: log.dataBefore }, { label: 'Po zmianie', data: log.dataAfter }].map(({ label, data }) => (
                <section key={label} className="min-w-0 space-y-2"><h3 className="text-sm font-medium tracking-normal">{label}</h3><pre className="max-h-96 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs whitespace-pre-wrap wrap-anywhere">{data === null ? 'Brak danych' : JSON.stringify(data, null, 2)}</pre></section>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
