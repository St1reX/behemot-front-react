import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { contractorApiClient } from '@/api/contractors/ContractorApiClient'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { Contractor } from '@/types/contractors/contractor.types'
import { ContractorDeleteDialog } from './components/ContractorDeleteDialog'
import { ContractorEditorDialog } from './components/ContractorEditorDialog'

export function ContractorsPage() {
  const { requirePrivilege } = useAccess()
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{ contractor: Contractor | null } | null>(null)
  const [deleting, setDeleting] = useState<Contractor | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.CONTRACTOR}:${ACTIONS.CREATE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.CONTRACTOR}:${ACTIONS.UPDATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.CONTRACTOR}:${ACTIONS.DELETE}`)
  const query = useQuery({
    queryKey: ['contractors'],
    queryFn: ({ signal }) => contractorApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.CONTRACTOR}:${ACTIONS.READ}`),
    retry: false,
  })
  const contractors = query.data ?? []
  const searchPhrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = contractors.filter((contractor) => contractor.name.toLocaleLowerCase('pl-PL').includes(searchPhrase))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kontrahenci"
        description="Zarządzaj kontrahentami powiązanymi z numerami referencyjnymi produktów."
        actions={canCreate && (
          <Button type="button" onClick={() => setEditor({ contractor: null })}>
            <Plus aria-hidden="true" />Dodaj kontrahenta
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
              {!query.isPending && !query.error && <span>Wyniki: {filtered.length} / {contractors.length}</span>}
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
              {contractors.length === 0 ? 'Nie dodano jeszcze żadnych kontrahentów.' : 'Brak wyników dla podanej frazy.'}
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
                {filtered.map((contractor) => (
                  <TableRow key={contractor.id}>
                    <TableCell className="max-w-xs pl-5 whitespace-normal wrap-anywhere font-medium">{contractor.name}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {new Date(contractor.createdAt).toLocaleDateString('pl-PL')}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="pr-5">
                        <div className="flex justify-end gap-1">
                          {canUpdate && (
                            <Button type="button" variant="ghost" size="icon" title="Edytuj" aria-label={`Edytuj ${contractor.name}`} onClick={() => setEditor({ contractor })}>
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button type="button" variant="ghost" size="icon" title="Usuń" aria-label={`Usuń ${contractor.name}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(contractor)}>
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
      {editor && <ContractorEditorDialog contractor={editor.contractor} onClose={() => setEditor(null)} />}
      {deleting && <ContractorDeleteDialog contractor={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
