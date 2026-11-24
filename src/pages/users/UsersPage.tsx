import { useQuery } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { userApiClient } from '@/api/users/UserApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import { useAuthStore } from '@/stores/auth.store'
import type { ManagedUser } from '@/types/users/user.types'
import { UserDeleteDialog } from './components/UserDeleteDialog'
import { UserEditorDialog } from './components/UserEditorDialog'

export function UsersPage() {
  const { requirePrivilege } = useAccess()
  const ownId = useAuthStore((state) => state.user?.id)
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<{ user: ManagedUser | null } | null>(null)
  const [deleting, setDeleting] = useState<ManagedUser | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.USER}:${ACTIONS.CREATE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.USER}:${ACTIONS.UPDATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.USER}:${ACTIONS.DELETE}`)
  const query = useQuery({
    queryKey: ['users'],
    queryFn: ({ signal }) => userApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.USER}:${ACTIONS.READ}`),
    retry: false,
  })
  const users = query.data ?? []
  const searchPhrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = users.filter((user) => (
    [user.username, user.email, user.role.name]
      .join(' ').toLocaleLowerCase('pl-PL').includes(searchPhrase)
  ))

  return (
    <div className="space-y-6">
      <PageHeader title="Użytkownicy" description="Zarządzaj kontami użytkowników, ich rolami i dostępem do aplikacji."
        actions={canCreate && <Button type="button" onClick={() => setEditor({ user: null })}><Plus aria-hidden="true" />Dodaj użytkownika</Button>} />
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <ListToolbar
            search={{ value: search, onChange: setSearch, label: 'Szukaj po nazwie, e-mailu lub roli', placeholder: 'Szukaj użytkowników…' }}
            summary={!query.isPending && !query.error && <span>Wyniki: {filtered.length} / {users.length}</span>}
            isFetching={query.isFetching}
            onRefresh={() => { void query.refetch() }}
          />
          {query.error ? (
            <p role="alert" className="p-6 text-sm text-destructive">{query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.</p>
          ) : query.isPending ? (
            <ListSkeleton message="Wczytywanie użytkowników…" />
          ) : filtered.length === 0 ? (
            <p role="status" className="p-10 text-center text-sm text-muted-foreground">
              {users.length === 0 ? 'Brak użytkowników.' : 'Brak wyników dla podanej frazy.'}
            </p>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead className="pl-5">Użytkownik</TableHead><TableHead>Rola</TableHead>
                <TableHead>Status</TableHead>
                {(canUpdate || canDelete) && <TableHead className="pr-5 text-right">Akcje</TableHead>}
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="max-w-xs pl-5 whitespace-normal wrap-anywhere">
                      <div className="font-medium">{user.username}{user.id === ownId && <span className="ml-2 rounded-md bg-muted px-2 py-1 text-xs font-normal text-muted-foreground">Twoje konto</span>}</div>
                      <div className="text-muted-foreground">{user.email}</div>
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal wrap-anywhere">{user.role.name}</TableCell>
                    <TableCell><span className={`rounded-md px-2 py-1 text-xs ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>{user.isActive ? 'Aktywny' : 'Nieaktywny'}</span></TableCell>
                    {(canUpdate || canDelete) && (
                      <TableCell className="pr-5"><div className="flex justify-end gap-1">
                        {canUpdate && <Button type="button" variant="ghost" size="icon" title="Edytuj" aria-label={`Edytuj ${user.username}`} onClick={() => setEditor({ user })}><Pencil aria-hidden="true" /></Button>}
                        {canDelete && user.id !== ownId && <Button type="button" variant="ghost" size="icon" title="Usuń" aria-label={`Usuń ${user.username}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(user)}><Trash2 aria-hidden="true" /></Button>}
                      </div></TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {editor && <UserEditorDialog user={editor.user} onClose={() => setEditor(null)} />}
      {deleting && <UserDeleteDialog user={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
