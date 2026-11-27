import { useQuery } from '@tanstack/react-query'
import { CarFront, Plus, Star, Trash2 } from 'lucide-react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import { vehicleApiClient } from '@/api/vehicles/VehicleApiClient'
import { Button } from '@/components/ui/button'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/constants/actions'
import { ENTITIES } from '@/constants/entities'
import type { ProductInput } from '@/types/products/product.schema'
import type { ProductFitment } from '@/types/products/product.types'

function withSelected<T extends { id: string }>(items: T[], selected?: T | null) {
  return selected && !items.some((item) => item.id === selected.id) ? [selected, ...items] : items
}

export function ProductFitmentsEditor({ original }: { original: ProductFitment[] }) {
  const { control, setValue, formState: { errors } } = useFormContext<ProductInput>()
  const { fields, append, remove } = useFieldArray({ control, name: 'productFitments', keyName: 'formKey' })
  const values = useWatch({ control, name: 'productFitments' })
  const { requirePrivilege } = useAccess()
  const canReadBrands = requirePrivilege(`${ENTITIES.CAR_BRAND}:${ACTIONS.READ}`)
  return <div className="space-y-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <CarFront aria-hidden="true" className="size-4 text-primary" />Dopasowania do pojazdów</h2>
        <p className="mt-1 text-xs text-muted-foreground">Dodaj dowolną liczbę pojazdów. Model i lata są opcjonalne. Główne dopasowanie zasila szablon ogłoszenia.</p>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={!canReadBrands} onClick={() => append({ carBrandId: null, carModelId: null, carGenerationId: null, isPrimary: fields.length === 0 })}>
        <Plus aria-hidden="true" />Dodaj pojazd</Button>
    </div>
    {!canReadBrands && <p className="text-xs text-muted-foreground">Brak uprawnienia do odczytu marek. Istniejące dopasowania można zachować.</p>}
    {fields.length === 0 && <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Nie dodano dopasowań. Możesz dodać samą markę, np. Żuk lub ARO.</div>}
    {fields.map((field, index) => <div key={field.formKey} className="rounded-xl border bg-muted/10 p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">Pojazd {index + 1}
        </span>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant={values[index]?.isPrimary ? 'secondary' : 'ghost'} aria-pressed={values[index]?.isPrimary} onClick={() => fields.forEach((_, position) => setValue(`productFitments.${position}.isPrimary`, position === index, { shouldDirty: true, shouldValidate: true }))}>
            <Star aria-hidden="true" />
            {values[index]?.isPrimary ? 'Główne dopasowanie' : 'Ustaw jako główne'}
          </Button>
          <Button type="button" size="icon-sm" variant="ghost" className="text-destructive" aria-label={`Usuń pojazd ${index + 1}`} onClick={() => { const wasPrimary = values[index]?.isPrimary; remove(index); if (wasPrimary && fields.length > 1) setValue('productFitments.0.isPrimary', true, { shouldDirty: true, shouldValidate: true }) }}>
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </div>
      <FitmentRow index={index} original={original.find((item) => item.id === values[index]?.id)} />
    </div>)}
    {(errors.productFitments?.root?.message || errors.productFitments?.message) && <p role="alert" className="text-xs text-destructive">
      {errors.productFitments.root?.message ?? errors.productFitments.message}
    </p>}
  </div>
}

function FitmentRow({ index, original }: { index: number; original?: ProductFitment }) {
  const { control, setValue, formState: { errors } } = useFormContext<ProductInput>()
  const fitment = useWatch({ control, name: `productFitments.${index}` })
  const { requirePrivilege } = useAccess()
  const readBrands = requirePrivilege(`${ENTITIES.CAR_BRAND}:${ACTIONS.READ}`)
  const readModels = requirePrivilege(`${ENTITIES.CAR_MODEL}:${ACTIONS.READ}`)
  const readGenerations = requirePrivilege(`${ENTITIES.CAR_GENERATION}:${ACTIONS.READ}`)
  const brands = useQuery({ queryKey: ['product-vehicle-brands'], queryFn: ({ signal }) => vehicleApiClient.brands.all(signal), enabled: readBrands, retry: false, staleTime: 60_000 })
  const models = useQuery({ queryKey: ['product-vehicle-models', fitment.carBrandId], queryFn: ({ signal }) => vehicleApiClient.models.allByBrand(fitment.carBrandId!, signal), enabled: readModels && Boolean(fitment.carBrandId), retry: false, staleTime: 60_000 })
  const generations = useQuery({ queryKey: ['product-vehicle-generations', fitment.carModelId], queryFn: ({ signal }) => vehicleApiClient.generations.allByModel(fitment.carModelId!, signal), enabled: readGenerations && Boolean(fitment.carModelId), retry: false, staleTime: 60_000 })
  const rowErrors = errors.productFitments?.[index]
  const error = brands.error ?? (fitment.carBrandId ? models.error : null) ?? (fitment.carModelId ? generations.error : null)
  return <div className="space-y-3">
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1.5">
        <label htmlFor={`brand-${index}`} className="text-xs font-medium">Marka *</label>
        <NativeSelect id={`brand-${index}`} className="w-full" value={fitment.carBrandId ?? ''} disabled={!readBrands || brands.isPending || Boolean(brands.error)} aria-invalid={Boolean(rowErrors?.carBrandId)} aria-describedby={rowErrors?.carBrandId ? `brand-error-${index}` : undefined} onChange={(event) => {
          setValue(`productFitments.${index}.carBrandId`, event.target.value || null, { shouldDirty: true, shouldValidate: true })
          setValue(`productFitments.${index}.carModelId`, null, { shouldDirty: true })
          setValue(`productFitments.${index}.carGenerationId`, null, { shouldDirty: true })
        }}>
          <NativeSelectOption value="">
            {brands.isFetching ? 'Wczytywanie marek…' : 'Wybierz markę'}
          </NativeSelectOption>
          {withSelected(brands.data ?? [], original?.carBrand ? { ...original.carBrand, createdAt: '', updatedAt: '' } : null).map((brand) => <NativeSelectOption key={brand.id} value={brand.id}>
            {brand.name}
          </NativeSelectOption>)}
        </NativeSelect>
        {rowErrors?.carBrandId && <p id={`brand-error-${index}`} className="text-xs text-destructive">
          {rowErrors.carBrandId.message}
        </p>}
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`model-${index}`} className="text-xs font-medium">Model</label>
        <NativeSelect id={`model-${index}`} className="w-full" value={fitment.carModelId ?? ''} disabled={!readModels || !fitment.carBrandId || models.isPending || Boolean(models.error)} onChange={(event) => { setValue(`productFitments.${index}.carModelId`, event.target.value || null, { shouldDirty: true, shouldValidate: true }); setValue(`productFitments.${index}.carGenerationId`, null, { shouldDirty: true }) }}>
          <NativeSelectOption value="">
            {models.isFetching ? 'Wczytywanie modeli…' : 'Bez modelu'}
          </NativeSelectOption>
          {withSelected(models.data ?? [], original?.carModel && original.carModel.carBrand.id === fitment.carBrandId ? { ...original.carModel, createdAt: '', updatedAt: '' } : null).map((model) => <NativeSelectOption key={model.id} value={model.id}>
            {model.name}
          </NativeSelectOption>)}
        </NativeSelect>
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`generation-${index}`} className="text-xs font-medium">Lata produkcji</label>
        <NativeSelect id={`generation-${index}`} className="w-full" value={fitment.carGenerationId ?? ''} disabled={!readGenerations || !fitment.carModelId || generations.isPending || Boolean(generations.error)} onChange={(event) => setValue(`productFitments.${index}.carGenerationId`, event.target.value || null, { shouldDirty: true, shouldValidate: true })}>
          <NativeSelectOption value="">
            {generations.isFetching ? 'Wczytywanie generacji…' : 'Bez lat produkcji'}
          </NativeSelectOption>
          {withSelected(generations.data ?? [], original?.carGeneration && original.carGeneration.carModel.id === fitment.carModelId ? { ...original.carGeneration, createdAt: '', updatedAt: '' } : null).map((generation) => <NativeSelectOption key={generation.id} value={generation.id}>
            {generation.startProduction}–{generation.endProduction ?? 'obecnie'}
          </NativeSelectOption>)}
        </NativeSelect>
      </div>
    </div>
    {(!readModels || !readGenerations) && <p className="text-xs text-muted-foreground">Wybór modelu i lat wymaga uprawnień do odpowiednich słowników pojazdów.</p>}
    {error && <div role="alert" className="flex flex-wrap items-center gap-2 text-xs text-destructive">
      <span>
        {error.message}
      </span>
      <Button type="button" size="sm" variant="outline" onClick={() => { if (brands.error) void brands.refetch(); if (models.error && fitment.carBrandId) void models.refetch(); if (generations.error && fitment.carModelId) void generations.refetch() }}>Ponów odczyt</Button>
    </div>}
  </div>
}
