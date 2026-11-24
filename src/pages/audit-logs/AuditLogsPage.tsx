import { getActionLabel } from '@/shared/constants/actions'
import { getEntityLabel } from '@/shared/constants/entities'
import { OPERATION_STATUS_CLASSES, OPERATION_STATUS_LABELS } from '@/shared/constants/operationStatuses'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Eye, History } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { auditLogApiClient } from '@/api/audit-logs/AuditLogApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { AuditLogFilters as Filters } from '@/types/audit-logs/auditLog.types'
import { formatAuditDate } from './auditLog.utils'
import { AuditLogDetailsDialog } from './components/AuditLogDetailsDialog'
import { AuditLogFilters } from './components/AuditLogFilters'

const PAGE_SIZE = 25

export function AuditLogsPage() {
  const [filters, setFilters] = useState<Filters>({})
  const [page, setPage] = useState(1)
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('log')
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const query = useQuery({
    queryKey: ['audit-logs', 'list', filters, page],
    queryFn: ({ signal }) => auditLogApiClient.list({ ...filters, page, pageSize: PAGE_SIZE }, signal),
    retry: false,
  })
  const totalPages = Math.max(1, Math.ceil((query.data?.total ?? 0) / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <PageHeader title="Logi audytowe" description="Historia operacji w systemie. Sprawdź, kto i kiedy wprowadził zmiany." />
      <AuditLogFilters onApply={(values) => { setFilters(values); setPage(1) }} />
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <CardContent className="p-0">
          <ListToolbar
            className="px-5"
            summary={<span>{activeFilterCount > 0 ? `Aktywne filtry: ${activeFilterCount}` : 'Wszystkie wpisy'} · Od najnowszych</span>}
            isFetching={query.isFetching}
            onRefresh={() => { void query.refetch() }}
          >
            <div className="flex items-center gap-2"><History aria-hidden="true" className="size-4 text-muted-foreground" /><h2 className="text-sm font-semibold tracking-normal">Historia operacji</h2>{query.data && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{query.data.total}</span>}</div>
          </ListToolbar>
          {query.error ? (
            <p role="alert" className="p-6 text-sm text-destructive">{query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.</p>
          ) : query.isPending ? (
            <ListSkeleton message="Wczytywanie historii…" rowClassName="h-12" className="space-y-3" />
          ) : query.data.items.length === 0 ? (
            <div role="status" className="grid justify-items-center gap-3 p-10 text-center"><History aria-hidden="true" className="size-8 text-muted-foreground/50" /><p className="text-sm font-medium">Brak wpisów</p><p className="text-sm text-muted-foreground">{activeFilterCount > 0 ? 'Zmień lub wyczyść filtry, aby zobaczyć więcej wyników.' : 'Zarejestrowane operacje pojawią się w tym miejscu.'}</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead className="pl-5">Data</TableHead><TableHead>Użytkownik</TableHead><TableHead>Obszar / rekord</TableHead><TableHead>Operacja</TableHead><TableHead>Wynik</TableHead><TableHead className="pr-5 text-right">Podgląd</TableHead></TableRow></TableHeader>
              <TableBody>{query.data.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="pl-5 text-xs"><time dateTime={log.createdAt}>{formatAuditDate(log.createdAt)}</time></TableCell>
                  <TableCell className="max-w-48 whitespace-normal wrap-anywhere font-medium">{log.username ?? log.userId}</TableCell>
                  <TableCell><p className="font-medium">{getEntityLabel(log.entityName)}</p>{log.comment && <p className="mt-1 max-w-xs truncate text-xs" title={log.comment}>{log.comment}</p>}<p className="mt-1 font-mono text-xs text-muted-foreground">{log.entityId}</p></TableCell>
                  <TableCell>{getActionLabel(log.action)}</TableCell>
                  <TableCell><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OPERATION_STATUS_CLASSES[log.operationStatus]}`}>{OPERATION_STATUS_LABELS[log.operationStatus]}</span>{log.isSuspicious && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Do sprawdzenia</p>}</TableCell>
                  <TableCell className="pr-5 text-right"><Button type="button" variant="ghost" size="icon" aria-label={`Szczegóły wpisu z ${formatAuditDate(log.createdAt)}`} onClick={() => setSearchParams({ log: log.id })}><Eye aria-hidden="true" /></Button></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground">
            <span>{query.data ? `Strona ${page} z ${totalPages} · ${PAGE_SIZE} wpisów na stronę` : `Strona ${page}`}</span>
            <div className="flex gap-2"><Button type="button" variant="outline" size="sm" disabled={page === 1 || query.isFetching} onClick={() => setPage(page - 1)}><ChevronLeft aria-hidden="true" />Poprzednia</Button><Button type="button" variant="outline" size="sm" disabled={!query.data || page >= totalPages || query.isFetching} onClick={() => setPage(page + 1)}>Następna<ChevronRight aria-hidden="true" /></Button></div>
          </div>
        </CardContent>
      </Card>
      {selectedId && <AuditLogDetailsDialog id={selectedId} onClose={() => setSearchParams({})} />}
    </div>
  )
}
