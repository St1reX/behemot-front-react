import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { vehicleApiClient } from '@/api/vehicles/VehicleApiClient'
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { VehicleEditorState, VehicleRecord } from '@/types/vehicles/vehicle.types'
import { VehicleDeleteDialog } from './components/VehicleDeleteDialog'
import { VehicleEditorDialog } from './components/VehicleEditorDialog'
import { VehicleList } from './components/VehicleList'
import { VEHICLE_ENTITIES } from './vehicle.constants'

export function VehiclesPage() {
  const [params] = useSearchParams()
  return <VehicleCatalog key={params.toString()} brandId={params.get('brand')} modelId={params.get('model')} />
}

function VehicleCatalog({ brandId, modelId }: { brandId: string | null; modelId: string | null }) {
  const { requirePrivilege } = useAccess()
  const [editor, setEditor] = useState<VehicleEditorState | null>(null)
  const [deleting, setDeleting] = useState<VehicleRecord | null>(null)
  const validSelection = (brandId === null || z.uuid().safeParse(brandId).success)
    && (modelId === null || (brandId !== null && z.uuid().safeParse(modelId).success))
  const canReadModels = requirePrivilege(`${ENTITIES.CAR_MODEL}:${ACTIONS.READ}`)
  const canReadGenerations = requirePrivilege(`${ENTITIES.CAR_GENERATION}:${ACTIONS.READ}`)

  const brands = useQuery({
    queryKey: ['vehicles', 'brands'],
    queryFn: ({ signal }) => vehicleApiClient.brands.list(signal),
    enabled: requirePrivilege(`${ENTITIES.CAR_BRAND}:${ACTIONS.READ}`),
    retry: false,
  })
  const selectedBrand = brands.data?.find((brand) => brand.id === brandId)
  const models = useQuery({
    queryKey: ['vehicles', 'models', brandId],
    queryFn: ({ signal }) => vehicleApiClient.models.listByBrand(selectedBrand?.id ?? '', signal),
    enabled: validSelection && Boolean(selectedBrand) && canReadModels,
    retry: false,
  })
  const selectedModel = selectedBrand && canReadModels
    ? models.data?.find((model) => model.id === modelId)
    : undefined
  const generations = useQuery({
    queryKey: ['vehicles', 'generations', modelId],
    queryFn: ({ signal }) => vehicleApiClient.generations.listByModel(selectedModel?.id ?? '', signal),
    enabled: validSelection && Boolean(selectedModel) && canReadGenerations,
    retry: false,
  })

  const level = modelId ? 'generation' : brandId ? 'model' : 'brand'
  const currentQuery = modelId ? generations : brandId ? models : brands
  const navigationError = brands.error
    ?? (brandId ? models.error : null)
    ?? (modelId ? generations.error : null)
  const missingSelection = (Boolean(brandId) && brands.isSuccess && !selectedBrand)
    || (Boolean(modelId) && Boolean(selectedBrand) && models.isSuccess && !selectedModel)
  const denied = (Boolean(brandId) && !canReadModels) || (Boolean(modelId) && !canReadGenerations)
  const title = modelId
    ? `Generacje${selectedModel ? ` — ${selectedModel.name}` : ''}`
    : brandId
      ? `Modele${selectedBrand ? ` — ${selectedBrand.name}` : ''}`
      : 'Marki pojazdów'
  const addLabel = modelId ? 'Dodaj generację' : brandId ? 'Dodaj model' : 'Dodaj markę'
  const canCreate = requirePrivilege(`${VEHICLE_ENTITIES[level]}:${ACTIONS.CREATE}`)
    && !navigationError && !missingSelection && validSelection && !denied
    && (level === 'brand' || (level === 'model' ? Boolean(selectedBrand) : Boolean(selectedModel)))
  const records: VehicleRecord[] = level === 'brand'
    ? (brands.data ?? []).map((item) => ({ type: 'brand', item }))
    : level === 'model'
      ? (models.data ?? []).map((item) => ({ type: 'model', item }))
      : (generations.data ?? []).map((item) => ({ type: 'generation', item }))

  function openCreate() {
    if (selectedModel && modelId) setEditor({ type: 'generation', carModel: selectedModel })
    else if (selectedBrand && brandId) setEditor({ type: 'model', carBrand: selectedBrand })
    else setEditor({ type: 'brand' })
  }

  function openEdit(record: VehicleRecord) {
    switch (record.type) {
      case 'brand':
        setEditor(record)
        break
      case 'model':
        setEditor({ ...record, carBrand: record.item.carBrand })
        break
      case 'generation':
        setEditor({ ...record, carModel: record.item.carModel })
    }
  }

  function refresh() {
    void brands.refetch()
    if (selectedBrand && canReadModels) void models.refetch()
    if (selectedModel && canReadGenerations) void generations.refetch()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Pojazdy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Marki, modele i ich generacje. Wybierz markę, aby przejść dalej.
        </p>
      </div>
      <nav aria-label="Ścieżka katalogu pojazdów">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          <li>
            {brandId ? (
              <Link to="/vehicles" className="text-primary underline-offset-4 hover:underline">Marki</Link>
            ) : <span aria-current="page">Marki</span>}
          </li>
          {brandId && (
            <>
              <li aria-hidden="true"><ChevronRight className="size-4 text-muted-foreground" /></li>
              <li>
                {modelId ? (
                  <Link to={`/vehicles?brand=${brandId}`} className="text-primary underline-offset-4 hover:underline">
                    {selectedBrand?.name ?? 'Marka'}
                  </Link>
                ) : <span aria-current="page">{selectedBrand?.name ?? 'Marka'}</span>}
              </li>
            </>
          )}
          {modelId && (
            <li aria-hidden="true"><ChevronRight className="size-4 text-muted-foreground" /></li>
          )}
          {modelId && <li aria-current="page">{selectedModel?.name ?? 'Model'}</li>}
        </ol>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {brandId && (
            <Button
              render={<Link to={modelId ? `/vehicles?brand=${brandId}` : '/vehicles'} />}
              nativeButton={false}
              variant="outline"
              size="icon"
              aria-label={modelId ? 'Wróć do modeli' : 'Wróć do marek'}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
          )}
          <h2 className="text-xl font-semibold wrap-anywhere">{title}</h2>
        </div>
        {canCreate && (
          <Button type="button" onClick={openCreate}><Plus aria-hidden="true" />{addLabel}</Button>
        )}
      </div>

      {!validSelection || missingSelection ? (
        <p role="alert" className="rounded-xl border bg-card p-6 text-sm">
          Nie znaleziono wybranej marki lub modelu. Wróć do poprzedniego poziomu i wybierz istniejący element.
        </p>
      ) : denied ? (
        <p role="alert" className="rounded-xl border bg-card p-6 text-sm">
          Nie masz uprawnień do odczytu {modelId && canReadModels ? 'generacji' : 'modeli'}.
        </p>
      ) : (
        <VehicleList
          records={records}
          isPending={currentQuery.isPending}
          isFetching={brands.isFetching || models.isFetching || generations.isFetching}
          error={navigationError}
          onRefresh={refresh}
          onEdit={openEdit}
          onDelete={setDeleting}
        />
      )}
      {editor && <VehicleEditorDialog editor={editor} onClose={() => setEditor(null)} />}
      {deleting && <VehicleDeleteDialog record={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
