import { ChevronRight, Pencil, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { VehicleRecord } from '@/types/vehicles/vehicle.types'
import { VEHICLE_ENTITIES } from '../vehicle.constants'
import { getVehicleErrorMessage, getVehicleLabel } from '../vehicle.utils'

interface VehicleListProps {
  records: VehicleRecord[]
  isPending: boolean
  isFetching: boolean
  error: unknown
  onRefresh: () => void
  onEdit: (record: VehicleRecord) => void
  onDelete: (record: VehicleRecord) => void
}

export function VehicleList({
  records, isPending, isFetching, error, onRefresh, onEdit, onDelete,
}: VehicleListProps) {
  const [search, setSearch] = useState('')
  const { requirePrivilege } = useAccess()
  const searchPhrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = records.filter((record) =>
    getVehicleLabel(record).toLocaleLowerCase('pl-PL').includes(searchPhrase),
  )

  return (
    <Card className="gap-0 py-0">
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
          <div className="relative w-full sm:max-w-xs">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Szukaj na liście"
              placeholder="Szukaj na tej liście…"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {!isPending && !error && <span>Wyniki: {filtered.length} / {records.length}</span>}
            <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onRefresh}>
              <RefreshCw aria-hidden="true" className={isFetching ? 'animate-spin motion-reduce:animate-none' : undefined} />
              Odśwież
            </Button>
          </div>
        </div>
        {error ? (
          <p role="alert" className="p-6 text-sm text-destructive">
            {getVehicleErrorMessage(error)} Użyj przycisku „Odśwież”, aby ponowić odczyt.
          </p>
        ) : isPending ? (
          <div role="status" className="space-y-4 p-5">
            <span className="sr-only">Wczytywanie listy…</span>
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} aria-hidden="true" className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p role="status" className="p-10 text-center text-sm text-muted-foreground">
            {records.length === 0 ? 'Na tym poziomie nie ma jeszcze żadnych elementów.' : 'Brak wyników dla podanej frazy.'}
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
              {filtered.map((record) => {
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
      </CardContent>
    </Card>
  )
}
