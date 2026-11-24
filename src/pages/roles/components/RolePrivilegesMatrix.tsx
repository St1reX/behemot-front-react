import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ACTIONS, getActionLabel } from '@/shared/constants/actions'
import { getEntityLabel } from '@/shared/constants/entities'
import type { RolePrivilege } from '@/types/roles/role.types'

export function RolePrivilegesMatrix({ privileges, value, onChange, disabled }: {
  privileges: RolePrivilege[]
  value: string[]
  onChange: (ids: string[]) => void
  disabled: boolean
}) {
  const [search, setSearch] = useState('')
  const selected = new Set(value)
  const groups = new Map<string, { id: string; action: string }[]>()
  for (const privilege of privileges) {
    const [entity, action] = privilege.name.split(':')
    if (!entity || !action) continue
    const group = groups.get(entity) ?? []
    group.push({ id: privilege.id, action })
    groups.set(entity, group)
  }
  const availableActions = new Set([...groups.values()].flatMap((group) => group.map((privilege) => privilege.action)))
  const actions = [...new Set([...Object.values(ACTIONS), ...availableActions])].filter((action) => availableActions.has(action))
  const phrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = [...groups.entries()]
    .sort(([left], [right]) => getEntityLabel(left).localeCompare(getEntityLabel(right), 'pl'))
    .filter(([entity]) => `${getEntityLabel(entity)} ${entity}`.toLocaleLowerCase('pl-PL').includes(phrase))

  function toggle(ids: string[], checked: boolean) {
    const next = new Set(value)
    ids.forEach((id) => { if (checked) next.add(id); else next.delete(id) })
    onChange([...next])
  }

  return (
    <section aria-label="Uprawnienia roli" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold">Uprawnienia</h3>
          <p className="text-xs text-muted-foreground" aria-live="polite">Wybrano {value.length} z {privileges.length}</p>
        </div>
        {!disabled && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onChange(privileges.map(({ id }) => id))}>Zaznacz wszystkie</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>Wyczyść</Button>
          </div>
        )}
      </div>
      <Input aria-label="Filtruj obszary uprawnień" placeholder="Szukaj obszaru uprawnień…" value={search} onChange={(event) => setSearch(event.target.value)} />
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-44">Obszar</TableHead>
              {actions.map((action) => <TableHead key={action} className="text-center">{getActionLabel(action)}</TableHead>)}
              <TableHead className="text-center">Cały obszar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(([entity, group]) => {
              const count = group.filter(({ id }) => selected.has(id)).length
              const label = getEntityLabel(entity)
              return (
                <TableRow key={entity}>
                  <TableCell className="whitespace-normal font-medium">{label}</TableCell>
                  {actions.map((action) => {
                    const privilege = group.find((item) => item.action === action)
                    return (
                      <TableCell key={action} className="text-center">
                        {privilege ? (
                          <Checkbox
                            aria-label={`${label}: ${getActionLabel(action)}`}
                            checked={selected.has(privilege.id)}
                            disabled={disabled}
                            onCheckedChange={(checked) => toggle([privilege.id], checked)}
                          />
                        ) : <span aria-label="Niedostępne" className="text-muted-foreground">—</span>}
                      </TableCell>
                    )
                  })}
                  <TableCell className="text-center">
                    <Checkbox
                      aria-label={`${label}: wszystkie uprawnienia`}
                      checked={count === group.length}
                      indeterminate={count > 0 && count < group.length}
                      disabled={disabled}
                      onCheckedChange={(checked) => toggle(group.map(({ id }) => id), checked)}
                    />
                  </TableCell>
                </TableRow>
              )
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={actions.length + 2} className="py-8 text-center text-muted-foreground">Brak obszarów do wyświetlenia.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
