import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/constants/actions'
import { ENTITIES } from '@/constants/entities'
import type { VehicleRecord } from '@/types/vehicles/vehicle.types'
import { VEHICLE_ENTITIES } from '../vehicle.constants'
import { getVehicleLabel } from '../vehicle.utils'

interface VehicleListProps {
  records: VehicleRecord[]
  page: number
  pageSize: number
  total: number | undefined
  search: string
  isGeneration: boolean
  onPageChange: (page: number) => void
  onSearch: (search: string) => void
  isPending: boolean
  isFetching: boolean
  error: Error | null
  onRefresh: () => void
  onEdit: (record: VehicleRecord) => void
  onDelete: (record: VehicleRecord) => void
}

export function VehicleList({
  records, isPending, isFetching, error, onRefresh, onEdit, onDelete,
  page, pageSize, total, search, isGeneration, onPageChange, onSearch,
}: VehicleListProps) {
  const [draftSearch, setDraftSearch] = useState('')
  const { requirePrivilege } = useAccess()
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize))

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-0">
        <ListToolbar
          search={{
            value: draftSearch,
            onChange: setDraftSearch,
            label: isGeneration ? 'Szukaj po roku początku lub końca produkcji albo wpisz obecnie' : 'Szukaj po nazwie',
            placeholder: isGeneration ? 'Rok początku / końca lub „obecnie”…' : 'Szukaj po nazwie…',
            maxLength: 100,
            onSubmit: () => onSearch(draftSearch.trim()),
          }}
          summary={!isPending && !error && total !== undefined && <span>Wyniki: {total}</span>}
          isFetching={isFetching}
          onRefresh={onRefresh}
        />
        {error ? (
          <p role="alert" className="p-6 text-sm text-destructive">
            {error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.
          </p>
        ) : isPending ? (
          <ListSkeleton message="Wczytywanie pojazdów…" />
        ) : records.length === 0 ? (
          <p role="status" className="p-10 text-center text-sm text-muted-foreground">
            {search ? 'Brak wyników dla podanej frazy.' : 'Na tym poziomie nie ma jeszcze żadnych elementów.'}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Nazwa / lata produkcji</TableHead>
                <TableHead>Przynależność</TableHead>
                <TableHead className="hidden lg:table-cell">Dodano</TableHead>
                <TableHead className="pr-5 text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const label = getVehicleLabel(record)
                const entity = VEHICLE_ENTITIES[record.type]
                const canOpen = record.type === 'brand'
                  ? requirePrivilege(`${ENTITIES.CAR_MODEL}:${ACTIONS.READ}`)
                  : record.type === 'model' && requirePrivilege(`${ENTITIES.CAR_GENERATION}:${ACTIONS.READ}`)
                const href = record.type === 'brand'
                  ? `/vehicles?brand=${record.item.id}`
                  : record.type === 'model'
                    ? `/vehicles?brand=${record.item.carBrand.id}&model=${record.item.id}`
                    : ''
                const parentLabel = record.type === 'brand'
                  ? 'Marka pojazdu'
                  : record.type === 'model'
                    ? record.item.carBrand.name
                    : `${record.item.carModel.carBrand.name} / ${record.item.carModel.name}`
                return (
                  <TableRow key={record.item.id}>
                    <TableCell className="pl-5 font-medium">
                      {canOpen ? (
                        <Link to={href} className="inline-flex items-center gap-2 rounded-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                          {label}<ChevronRight aria-hidden="true" className="size-4 shrink-0" />
                          <span className="sr-only">— pokaż {record.type === 'brand' ? 'modele' : 'generacje'}</span>
                        </Link>
                      ) : label}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parentLabel}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground lg:table-cell">
                      {new Date(record.item.createdAt).toLocaleDateString('pl-PL')}
                    </TableCell>
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-1">
                        {requirePrivilege(`${entity}:${ACTIONS.UPDATE}`) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edytuj ${label}`}
                            title="Edytuj"
                            onClick={() => onEdit(record)}
                          >
                            <Pencil aria-hidden="true" />
                          </Button>
                        )}
                        {requirePrivilege(`${entity}:${ACTIONS.DELETE}`) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            aria-label={`Usuń ${label}`}
                            title="Usuń"
                            onClick={() => onDelete(record)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs text-muted-foreground">
          <span>{total !== undefined ? `Strona ${page} z ${totalPages} · ${pageSize} wpisów na stronę` : `Strona ${page}`}</span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page === 1 || isFetching} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft aria-hidden="true" />Poprzednia
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={total === undefined || page >= totalPages || isFetching} onClick={() => onPageChange(page + 1)}>
              Następna<ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
