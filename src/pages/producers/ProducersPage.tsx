import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { producerApiClient } from '@/api/producers/ProducerApiClient'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { Producer } from '@/types/producers/producer.types'
import { ProducerDeleteDialog } from './components/ProducerDeleteDialog'
import { ProducerEditorDialog } from './components/ProducerEditorDialog'

export function ProducersPage() {
  const { requirePrivilege } = useAccess()
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{ producer: Producer | null } | null>(null)
  const [deleting, setDeleting] = useState<Producer | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.PRODUCER}:${ACTIONS.CREATE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.PRODUCER}:${ACTIONS.UPDATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.PRODUCER}:${ACTIONS.DELETE}`)
  const query = useQuery({
    queryKey: ['producers'],
    queryFn: ({ signal }) => producerApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.PRODUCER}:${ACTIONS.READ}`),
    retry: false,
  })
  const producers = query.data ?? []
  const searchPhrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = producers.filter((producer) => producer.name.toLocaleLowerCase('pl-PL').includes(searchPhrase))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Producenci"
        description="Zarządzaj producentami przypisywanymi do produktów."
        actions={canCreate && (
          <Button type="button" onClick={() => setEditor({ producer: null })}>
            <Plus aria-hidden="true" />Dodaj producenta
          </Button>
        )}
      />
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="relative w-full sm:max-w-xs">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Szukaj po nazwie"
                placeholder="Szukaj po nazwie…"
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {!query.isPending && !query.error && <span>Wyniki: {filtered.length} / {producers.length}</span>}
              <Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => { void query.refetch() }}>
                <RefreshCw aria-hidden="true" className={query.isFetching ? 'animate-spin motion-reduce:animate-none' : undefined} />
                Odśwież
              </Button>
            </div>
          </div>
          {query.error ? (
            <p role="alert" className="p-6 text-sm text-destructive">
              {query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.
            </p>
          ) : query.isPending ? (
            <div role="status" className="space-y-4 p-5">
              <span className="sr-only">Wczytywanie listy…</span>
              {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} aria-hidden="true" className="h-10 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p role="status" className="p-10 text-center text-sm text-muted-foreground">
              {producers.length === 0 ? 'Nie dodano jeszcze żadnych producentów.' : 'Brak wyników dla podanej frazy.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Nazwa</TableHead>
                  <TableHead className="hidden sm:table-cell">Dodano</TableHead>
                  {(canUpdate || canDelete) && <TableHead className="pr-5 text-right">Akcje</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((producer) => (
                  <TableRow key={producer.id}>
                    <TableCell className="max-w-xs pl-5 whitespace-normal wrap-anywhere font-medium">{producer.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {new Date(producer.createdAt).toLocaleDateString('pl-PL')}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="pr-5">
                        <div className="flex justify-end gap-1">
                          {canUpdate && (
                            <Button type="button" variant="ghost" size="icon" title="Edytuj" aria-label={`Edytuj ${producer.name}`} onClick={() => setEditor({ producer })}>
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button type="button" variant="ghost" size="icon" title="Usuń" aria-label={`Usuń ${producer.name}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(producer)}>
                              <Trash2 aria-hidden="true" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {editor && <ProducerEditorDialog producer={editor.producer} onClose={() => setEditor(null)} />}
      {deleting && <ProducerDeleteDialog producer={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
