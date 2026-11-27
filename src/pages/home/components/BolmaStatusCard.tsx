import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, CircleAlert, CircleHelp, Database, RefreshCw } from 'lucide-react'
import { importsApiClient } from '@/api/imports/ImportsApiClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function BolmaStatusCard() {
  const statusQuery = useQuery({
    queryKey: ['bolma', 'status'],
    queryFn: ({ signal }) => importsApiClient.getBolmaStatus(signal),
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: false,
  })

  const isUnknown = statusQuery.isError || statusQuery.isPaused
  const isAvailable = !isUnknown
    && statusQuery.data?.status === 'ok'
    && statusQuery.data.components.database === 'ok'
  const isLoading = statusQuery.isPending && !statusQuery.isPaused
  const lastCheckedAt = Math.max(statusQuery.dataUpdatedAt, statusQuery.errorUpdatedAt)
  const StatusIcon = isUnknown ? CircleHelp : isAvailable ? CheckCircle2 : CircleAlert
  const statusLabel = isUnknown ? 'Brak odczytu' : isAvailable ? 'Dostępna' : 'Niedostępna'

  return (
    <Card className="relative gap-5 shadow-sm [--card-spacing:--spacing(5)]">
      <CardHeader className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/8 text-primary">
            <Database aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-normal">Katalog Bolma</h3>
            <p className="mt-1 text-xs text-muted-foreground">Katalog wewnętrzny</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Sprawdź status Bolmy"
          title="Sprawdź status Bolmy"
          disabled={statusQuery.isFetching || statusQuery.isPaused}
          onClick={() => void statusQuery.refetch()}
        >
          <RefreshCw
            aria-hidden="true"
            className={cn('size-4', statusQuery.isFetching && 'animate-spin motion-reduce:animate-none')}
          />
        </Button>
      </CardHeader>
      <CardContent>
        <div role="status" aria-live="polite" aria-atomic="true" className="min-h-25">
          {isLoading ? (
            <>
              <span className="sr-only">Sprawdzanie połączenia z bazą Bolmy…</span>
              <div aria-hidden="true" className="space-y-3">
                <Skeleton className="h-7 w-28 rounded-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </>
          ) : (
            <>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                  isUnknown
                    ? 'border-border bg-muted text-muted-foreground'
                    : isAvailable
                      ? 'border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-destructive/20 bg-destructive/10 text-destructive',
                )}
              >
                <StatusIcon aria-hidden="true" className="size-3.5" />
                {statusLabel}
              </span>
              <p className="mt-3 text-sm text-muted-foreground">
                {isUnknown
                  ? statusQuery.error?.message ?? 'Oczekiwanie na połączenie z internetem.'
                  : isAvailable
                    ? 'Połączenie z bazą działa prawidłowo.'
                    : 'Baza katalogu nie odpowiada. Spróbujemy ponownie za chwilę.'}
              </p>
            </>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground">
          <span>Baza danych</span>
          <span>
            {lastCheckedAt > 0 ? (
              <>Ostatnia próba: <time dateTime={new Date(lastCheckedAt).toISOString()}>
                {new Date(lastCheckedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
              </time></>
            ) : 'Oczekiwanie na odczyt'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
