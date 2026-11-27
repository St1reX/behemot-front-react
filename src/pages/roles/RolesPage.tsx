import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { roleApiClient } from '@/api/roles/RoleApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/constants/actions'
import { ENTITIES } from '@/constants/entities'
import { useAuthStore } from '@/stores/auth.store'
import type { Role } from '@/types/roles/role.types'
import { RoleDeleteDialog } from './components/RoleDeleteDialog'
import { RoleEditorDialog } from './components/RoleEditorDialog'

export function RolesPage() {
  const { requirePrivilege } = useAccess()
  const ownRoleId = useAuthStore((state) => state.user?.role.id)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{ role: Role | null } | null>(null)
  const [deleting, setDeleting] = useState<Role | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.ROLE}:${ACTIONS.CREATE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.ROLE}:${ACTIONS.UPDATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.ROLE}:${ACTIONS.DELETE}`)
  const query = useQuery({
    queryKey: ['roles'],
    queryFn: ({ signal }) => roleApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.ROLE}:${ACTIONS.READ}`),
    retry: false,
  })
  const roles = query.data ?? []
  const searchPhrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = roles.filter((role) => role.name.toLocaleLowerCase('pl-PL').includes(searchPhrase))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role"
        description="Zarządzaj rolami i ich uprawnieniami."
        actions={canCreate && (
          <Button type="button" onClick={() => setEditor({ role: null })}>
            <Plus aria-hidden="true" />Dodaj rolę
          </Button>
        )}
      />
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <ListToolbar
            search={{ value: search, onChange: setSearch, label: 'Szukaj po nazwie', placeholder: 'Szukaj po nazwie…' }}
            summary={!query.isPending && !query.error && <span>Wyniki: {filtered.length} / {roles.length}</span>}
            isFetching={query.isFetching}
            onRefresh={() => { void query.refetch() }}
          />
          {query.error ? (
            <p role="alert" className="p-6 text-sm text-destructive">
              {query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.
            </p>
          ) : query.isPending ? (
            <ListSkeleton message="Wczytywanie ról…" />
          ) : filtered.length === 0 ? (
            <p role="status" className="p-10 text-center text-sm text-muted-foreground">
              {roles.length === 0 ? 'Nie dodano jeszcze żadnych ról.' : 'Brak wyników dla podanej frazy.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Nazwa</TableHead>
                  <TableHead className="hidden sm:table-cell">Dodano</TableHead>
                  <TableHead className="pr-5 text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="max-w-xs pl-5 whitespace-normal wrap-anywhere font-medium">
                      {role.name}
                      {role.id === ownRoleId && <span className="ml-2 rounded-md bg-muted px-2 py-1 text-xs font-normal text-muted-foreground">Twoja rola</span>}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {new Date(role.createdAt).toLocaleDateString('pl-PL')}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-1">
                        {canUpdate && role.id !== ownRoleId ? (
                          <Button type="button" variant="ghost" size="icon" title="Edytuj" aria-label={`Edytuj ${role.name}`} onClick={() => setEditor({ role })}>
                            <Pencil aria-hidden="true" />
                          </Button>
                        ) : (
                          <Button type="button" variant="ghost" size="icon" title="Podgląd uprawnień" aria-label={`Uprawnienia roli ${role.name}`} onClick={() => setEditor({ role })}>
                            <Eye aria-hidden="true" />
                          </Button>
                        )}
                        {canDelete && role.id !== ownRoleId && (
                          <Button type="button" variant="ghost" size="icon" title="Usuń" aria-label={`Usuń ${role.name}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(role)}>
                            <Trash2 aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {editor && (
        <RoleEditorDialog
          role={editor.role}
          isOwnRole={editor.role?.id === ownRoleId}
          readOnly={editor.role !== null && (!canUpdate || editor.role.id === ownRoleId)}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && <RoleDeleteDialog role={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
