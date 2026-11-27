import { DEFAULT_PAGE_SIZE } from '@/shared/constants/pagination'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { z } from 'zod'
import { vehicleApiClient } from '@/api/vehicles/VehicleApiClient'
import { PageHeader } from '@/components/common/PageHeader'
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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const validSelection = (brandId === null || z.uuid().safeParse(brandId).success)
    && (modelId === null || (brandId !== null && z.uuid().safeParse(modelId).success))
  const canReadModels = requirePrivilege(`${ENTITIES.CAR_MODEL}:${ACTIONS.READ}`)
  const canReadGenerations = requirePrivilege(`${ENTITIES.CAR_GENERATION}:${ACTIONS.READ}`)
  const listParams = { page, pageSize: DEFAULT_PAGE_SIZE, search: search || undefined }

  const brand = useQuery({
    queryKey: ['vehicles', 'brand', brandId],
    queryFn: ({ signal }) => vehicleApiClient.brands.get(brandId!, signal),
    enabled: validSelection && Boolean(brandId),
    retry: false,
  })
  const selectedBrand = brand.data
  const model = useQuery({
    queryKey: ['vehicles', 'model', modelId],
    queryFn: ({ signal }) => vehicleApiClient.models.get(modelId!, signal),
    enabled: validSelection && Boolean(selectedBrand) && Boolean(modelId) && canReadModels,
    retry: false,
  })
  const selectedModel = selectedBrand && canReadModels && model.data?.carBrand.id === brandId ? model.data : undefined

  const brands = useQuery({
    queryKey: ['vehicles', 'brands', listParams],
    queryFn: ({ signal }) => vehicleApiClient.brands.list(listParams, signal),
    enabled: validSelection && !brandId && requirePrivilege(`${ENTITIES.CAR_BRAND}:${ACTIONS.READ}`),
    retry: false,
  })
  const models = useQuery({
    queryKey: ['vehicles', 'models', brandId, listParams],
    queryFn: ({ signal }) => vehicleApiClient.models.listByBrand(brandId!, listParams, signal),
    enabled: validSelection && Boolean(selectedBrand) && !modelId && canReadModels,
    retry: false,
  })
  const generations = useQuery({
    queryKey: ['vehicles', 'generations', modelId, listParams],
    queryFn: ({ signal }) => vehicleApiClient.generations.listByModel(modelId!, listParams, signal),
    enabled: validSelection && Boolean(selectedModel) && canReadGenerations,
    retry: false,
  })

  const level = modelId ? 'generation' : brandId ? 'model' : 'brand'
  const currentQuery = modelId ? generations : brandId ? models : brands
  const navigationError = brand.error ?? model.error ?? currentQuery.error
  const missingSelection = Boolean(selectedBrand) && canReadModels && Boolean(modelId)
    && model.isSuccess && model.data.carBrand.id !== brandId
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
    ? (brands.data?.items ?? []).map((item) => ({ type: 'brand', item }))
    : level === 'model'
      ? (models.data?.items ?? []).map((item) => ({ type: 'model', item }))
      : (generations.data?.items ?? []).map((item) => ({ type: 'generation', item }))
  const total = currentQuery.data?.total
  const totalPages = Math.max(1, Math.ceil((total ?? 0) / DEFAULT_PAGE_SIZE))

  useEffect(() => {
    if (total !== undefined && page > totalPages) setPage(totalPages)
  }, [total, page, totalPages])

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
    void currentQuery.refetch()
    if (brandId) void brand.refetch()
    if (modelId && canReadModels) void model.refetch()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pojazdy"
        description="Marki, modele i ich generacje. Wybierz markę, aby przejść dalej."
      />
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
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          total={total}
          search={search}
          isGeneration={level === 'generation'}
          onPageChange={setPage}
          onSearch={(value) => { setSearch(value); setPage(1) }}
          isPending={currentQuery.isPending}
          isFetching={currentQuery.isFetching || brand.isFetching || model.isFetching}
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
