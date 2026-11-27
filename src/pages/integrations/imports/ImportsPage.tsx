import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Database } from 'lucide-react'
import { useState } from 'react'
import { importsApiClient } from '@/api/imports/ImportsApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { BolmaIntegration } from '@/types/imports/imports.types'
import { BolmaDetailsDialog } from './components/BolmaDetailsDialog'

export function ImportsPage() {
  const [selected, setSelected] = useState<BolmaIntegration | null>(null)
  const query = useQuery({
    queryKey: ['bolma', 'configuration'],
    queryFn: ({ signal }) => importsApiClient.getBolmaConfiguration(signal),
    retry: false,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Importy" description="Źródła danych do importu katalogu produktów." />
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <ListToolbar isFetching={query.isFetching} onRefresh={() => { void query.refetch() }} />
          <section aria-label="Źródła importu" className="p-4 sm:p-6">
            {query.error ? (
              <p role="alert" className="text-sm text-destructive">{query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.</p>
            ) : query.isPending ? (
              <ListSkeleton message="Wczytywanie konfiguracji Bolmy…" />
            ) : query.data && (
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-4 rounded-xl border bg-muted/30 p-4 text-left whitespace-normal"
                onClick={() => { if (query.data) setSelected(query.data) }}
              >
                <Database aria-hidden="true" className="size-5 shrink-0 text-primary" />
                <span className="min-w-0 flex-1"><span className="block font-semibold">{query.data.name}</span><span className="block text-xs font-normal text-muted-foreground">Katalog produktów · MySQL</span></span>
                <span className="text-xs text-muted-foreground">{query.data.isConfigured ? 'Skonfigurowana' : 'Brak konfiguracji'}</span>
                <ChevronRight aria-hidden="true" className="shrink-0" />
              </Button>
            )}
          </section>
        </CardContent>
      </Card>
      {selected && <BolmaDetailsDialog integration={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
