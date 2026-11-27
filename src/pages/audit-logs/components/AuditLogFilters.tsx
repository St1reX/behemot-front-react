import { RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { FormActions } from '@/components/common/FormActions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { AuditLogFilters as Filters } from '@/types/audit-logs/auditLog.types'
import { ACTION_LABELS } from '@/constants/actions'
import { ENTITY_LABELS } from '@/constants/entities'
import { OPERATION_STATUS_LABELS } from '@/constants/operationStatuses'

const emptyFilters = { search: '', entityName: '', action: '', operationStatus: '', from: '', to: '' }

export function AuditLogFilters({ onApply }: { onApply: (filters: Filters) => void }) {
  const [draft, setDraft] = useState(emptyFilters)

  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      <CardHeader className="flex items-center gap-3 border-b bg-muted/30 px-5 py-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground"><SlidersHorizontal aria-hidden="true" className="size-4" /></span>
        <div><h2 className="text-sm font-semibold tracking-normal">Filtry historii</h2><p className="mt-0.5 text-xs text-muted-foreground">Znajdź operację po użytkowniku, obszarze lub dacie.</p></div>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={(event) => {
          event.preventDefault()
          onApply({
            search: draft.search.trim() || undefined,
            entityName: (draft.entityName || undefined) as Filters['entityName'],
            action: (draft.action || undefined) as Filters['action'],
            operationStatus: (draft.operationStatus || undefined) as Filters['operationStatus'],
            from: draft.from ? new Date(`${draft.from}T00:00:00`).toISOString() : undefined,
            to: draft.to ? new Date(`${draft.to}T23:59:59.999`).toISOString() : undefined,
          })
        }} onReset={() => { setDraft(emptyFilters); onApply({}) }}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="grid gap-2">
              <label htmlFor="audit-search" className="text-xs font-medium">Szukaj w historii</label>
              <div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input id="audit-search" className="pl-9" placeholder="Użytkownik, ID lub komentarz…" maxLength={100} value={draft.search} onChange={(event) => setDraft({ ...draft, search: event.target.value })} /></div>
            </div>
            <div className="grid gap-2">
              <label htmlFor="audit-entity" className="text-xs font-medium">Obszar systemu</label>
              <NativeSelect id="audit-entity" className="w-full" value={draft.entityName} onChange={(event) => setDraft({ ...draft, entityName: event.target.value })}>
                <NativeSelectOption value="">Wszystkie obszary</NativeSelectOption>
                {Object.entries(ENTITY_LABELS).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <label htmlFor="audit-action" className="text-xs font-medium">Operacja</label>
              <NativeSelect id="audit-action" className="w-full" value={draft.action} onChange={(event) => setDraft({ ...draft, action: event.target.value })}>
                <NativeSelectOption value="">Wszystkie operacje</NativeSelectOption>
                {Object.entries(ACTION_LABELS).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <label htmlFor="audit-status" className="text-xs font-medium">Wynik operacji</label>
              <NativeSelect id="audit-status" className="w-full" value={draft.operationStatus} onChange={(event) => setDraft({ ...draft, operationStatus: event.target.value })}>
                <NativeSelectOption value="">Wszystkie wyniki</NativeSelectOption>
                {Object.entries(OPERATION_STATUS_LABELS).map(([value, label]) => <NativeSelectOption key={value} value={value}>{label}</NativeSelectOption>)}
              </NativeSelect>
            </div>
            <div className="grid gap-2">
              <label htmlFor="audit-from" className="text-xs font-medium">Od dnia</label>
              <Input id="audit-from" type="date" max={draft.to || '9999-12-31'} value={draft.from} onChange={(event) => setDraft({ ...draft, from: event.target.value })} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="audit-to" className="text-xs font-medium">Do dnia</label>
              <Input id="audit-to" type="date" min={draft.from || undefined} max="9999-12-31" value={draft.to} onChange={(event) => setDraft({ ...draft, to: event.target.value })} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs text-muted-foreground">Wybierz kryteria i zastosuj filtry.</p>
            <FormActions layout="inline" submitLabel={<><Search aria-hidden="true" />Zastosuj filtry</>} submitProps={{ size: 'sm' }}>
              <Button type="reset" variant="ghost" size="sm"><RotateCcw aria-hidden="true" />Wyczyść</Button>
            </FormActions>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
