import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { departmentApiClient } from '@/api/departments/DepartmentApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/constants/actions'
import { ENTITIES } from '@/constants/entities'
import type { Department } from '@/types/departments/department.types'
import { DepartmentDeleteDialog } from './components/DepartmentDeleteDialog'
import { DepartmentEditorDialog } from './components/DepartmentEditorDialog'

export function DepartmentsPage() {
  const { requirePrivilege } = useAccess()
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{ department: Department | null } | null>(null)
  const [deleting, setDeleting] = useState<Department | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.DEPARTMENT}:${ACTIONS.CREATE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.DEPARTMENT}:${ACTIONS.UPDATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.DEPARTMENT}:${ACTIONS.DELETE}`)
  const query = useQuery({
    queryKey: ['departments'],
    queryFn: ({ signal }) => departmentApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.DEPARTMENT}:${ACTIONS.READ}`),
    retry: false,
  })
  const departments = query.data ?? []
  const searchPhrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = departments.filter((department) => `${department.name} ${department.shortcut}`.toLocaleLowerCase('pl-PL').includes(searchPhrase))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Działy"
        description="Zarządzaj działami przypisywanymi do produktów i szablonów ogłoszeń."
        actions={canCreate && (
          <Button type="button" onClick={() => setEditor({ department: null })}>
            <Plus aria-hidden="true" />Dodaj dział
          </Button>
        )}
      />
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <ListToolbar
            search={{ value: search, onChange: setSearch, label: 'Szukaj po nazwie lub skrócie', placeholder: 'Szukaj po nazwie lub skrócie…' }}
            summary={!query.isPending && !query.error && <span>Wyniki: {filtered.length} / {departments.length}</span>}
            isFetching={query.isFetching}
            onRefresh={() => { void query.refetch() }}
          />
          {query.error ? (
            <p role="alert" className="p-6 text-sm text-destructive">
              {query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.
            </p>
          ) : query.isPending ? (
            <ListSkeleton message="Wczytywanie działów…" />
          ) : filtered.length === 0 ? (
            <p role="status" className="p-10 text-center text-sm text-muted-foreground">
              {departments.length === 0 ? 'Nie dodano jeszcze żadnych działów.' : 'Brak wyników dla podanej frazy.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Nazwa</TableHead>
                  <TableHead>Skrót</TableHead>
                  <TableHead className="hidden sm:table-cell">Dodano</TableHead>
                  {(canUpdate || canDelete) && <TableHead className="pr-5 text-right">Akcje</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell className="max-w-xs pl-5 whitespace-normal wrap-anywhere font-medium">{department.name}</TableCell>
                    <TableCell>{department.shortcut}</TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {new Date(department.createdAt).toLocaleDateString('pl-PL')}
                    </TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="pr-5">
                        <div className="flex justify-end gap-1">
                          {canUpdate && (
                            <Button type="button" variant="ghost" size="icon" title="Edytuj" aria-label={`Edytuj ${department.name}`} onClick={() => setEditor({ department })}>
                              <Pencil aria-hidden="true" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button type="button" variant="ghost" size="icon" title="Usuń" aria-label={`Usuń ${department.name}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(department)}>
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
      {editor && <DepartmentEditorDialog department={editor.department} onClose={() => setEditor(null)} />}
      {deleting && <DepartmentDeleteDialog department={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
