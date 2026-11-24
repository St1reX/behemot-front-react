import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Boxes, ImageIcon, Package, Save, Scale } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { FormProvider, useController, useForm, useFormContext, useWatch } from 'react-hook-form'
import type { FieldPath } from 'react-hook-form'
import { Link, useBlocker, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { departmentApiClient } from '@/api/departments/DepartmentApiClient'
import { ApiError } from '@/api/errors'
import { productListingTemplateApiClient } from '@/api/product-listing-templates/ProductListingTemplateApiClient'
import { productApiClient } from '@/api/products/ProductApiClient'
import { producerApiClient } from '@/api/producers/ProducerApiClient'
import { warehouseApiClient } from '@/api/warehouses/WarehouseApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { FormActions } from '@/components/common/FormActions'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { useAccess } from '@/hooks/useAccess'
import { toast } from '@/lib/toast'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import { productSchema } from '@/types/products/product.schema'
import type { ProductInput } from '@/types/products/product.schema'
import type { Product } from '@/types/products/product.types'
import { ProductFitmentsEditor } from './components/ProductFitmentsEditor'
import { ProductImage } from './components/ProductImage'
import { ProductIntegrations } from './components/ProductIntegrations'
import { SIDE_LABELS } from './product.constants'
import { formatPrice } from './product.utils'

const textareaClass = 'min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive disabled:opacity-50'
const nullable = (value: unknown) => typeof value === 'string' ? value.trim() || null : value

function fieldErrorMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined
  if ('message' in error && typeof error.message === 'string') return error.message
  if (Array.isArray(error)) return error.map(fieldErrorMessage).find(Boolean)
  return undefined
}

function LinesInput({ name }: { name: 'imagesUrls' | 'descriptionImagesUrls' | 'oem' }) {
  const { control } = useFormContext<ProductInput>()
  const { field: { value, onChange, onBlur, ref, name: fieldName }, fieldState } = useController({ control, name })
  const [text, setText] = useState(() => value.join('\n'))
  return <textarea id={`product-${name}`} ref={ref} name={fieldName}
    className={`${textareaClass} font-mono text-xs`} value={text} onBlur={onBlur}
    onChange={(event) => {
      setText(event.target.value)
      onChange(event.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean))
    }}
    aria-invalid={Boolean(fieldState.error)}
    aria-describedby={fieldState.error ? `product-${name}-error` : undefined} />
}

function initialValues(product?: Product): ProductInput {
  return product ? {
    sku: product.sku, ean: product.ean, oem: product.oem, customName: product.customName,
    customSummary: product.customSummary, customDescription: product.customDescription, internalNote: product.internalNote,
    price: Number(product.price), quantity: product.quantity, side: product.side,
    weight: Number(product.weight), length: Number(product.length), width: Number(product.width), height: product.height === null ? null : Number(product.height),
    warehouseLocation: product.warehouseLocation, warehouseId: product.warehouse.id,
    producerId: product.producer.id, departmentId: product.department.id, listingTemplateId: product.listingTemplate.id,
    imagesUrls: product.imagesUrls, descriptionImagesUrls: product.descriptionImagesUrls,
    productFitments: product.productFitments.map((fitment) => ({
      id: fitment.id, isPrimary: fitment.isPrimary,
      carBrandId: fitment.carBrand?.id ?? fitment.carGeneration?.carModel.carBrand.id ?? null,
      carModelId: fitment.carModel?.id ?? fitment.carGeneration?.carModel.id ?? null,
      carGenerationId: fitment.carGeneration?.id ?? null,
    })),
  } : {
    sku: '', ean: null, oem: [], customName: null, customSummary: null, customDescription: null, internalNote: null,
    price: 0, quantity: 0, side: 'NONE', weight: 0, length: 0, width: 0, height: null,
    warehouseLocation: '', warehouseId: '', producerId: '', departmentId: '', listingTemplateId: '',
    imagesUrls: [], descriptionImagesUrls: [], productFitments: [],
  }
}

export function ProductEditorPage() {
  const { id } = useParams()
  const validId = !id || z.uuid().safeParse(id).success
  const product = useQuery({
    queryKey: ['products', id], queryFn: ({ signal }) => productApiClient.get(id!, signal),
    enabled: Boolean(id) && validId, retry: false, refetchOnMount: 'always', refetchOnWindowFocus: false, refetchOnReconnect: false,
  })
  if (!validId) return <p role="alert">Niepoprawny identyfikator produktu.</p>
  if (id && product.error) return <div className="space-y-3">
    <p role="alert" className="text-destructive">
      {product.error.message}
    </p>
    <Button onClick={() => { void product.refetch() }}>Ponów odczyt</Button>
    <Button nativeButton={false} variant="outline" render={<Link to="/products" />}>Wróć do produktów</Button>
  </div>
  if (id && (!product.data || !product.isFetchedAfterMount)) return <ListSkeleton message="Wczytywanie edytora produktu…" />
  return <ProductForm key={id ?? 'new'} product={product.data} />
}

function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const saved = useRef(false)
  const { requirePrivilege } = useAccess()
  const canRead = (entity: typeof ENTITIES[keyof typeof ENTITIES]) => requirePrivilege(`${entity}:${ACTIONS.READ}`)
  const canEdit = requirePrivilege(`${ENTITIES.PRODUCT}:${product ? ACTIONS.UPDATE : ACTIONS.CREATE}`)
  const form = useForm<ProductInput>({ resolver: zodResolver(productSchema), defaultValues: initialValues(product) })
  const { register, control, handleSubmit, setValue, setError, getFieldState, formState, reset } = form
  const { isDirty } = formState
  const [departmentId, price, customName, images] = useWatch({ control, name: ['departmentId', 'price', 'customName', 'imagesUrls'] })
  const departments = useQuery({ queryKey: ['departments'], queryFn: ({ signal }) => departmentApiClient.list(signal), enabled: canRead(ENTITIES.DEPARTMENT), retry: false })
  const producers = useQuery({ queryKey: ['producers'], queryFn: ({ signal }) => producerApiClient.list(signal), enabled: canRead(ENTITIES.PRODUCER), retry: false })
  const warehouses = useQuery({ queryKey: ['warehouses'], queryFn: ({ signal }) => warehouseApiClient.list(signal), enabled: canRead(ENTITIES.WAREHOUSE), retry: false })
  const templates = useQuery({ queryKey: ['product-listing-templates'], queryFn: ({ signal }) => productListingTemplateApiClient.list(signal), enabled: canRead(ENTITIES.PRODUCT_LISTING_TEMPLATE), retry: false })
  const lookups = [departments, producers, warehouses, templates]
  const lookupError = lookups.find((query) => query.error)?.error
  const lookupLoading = lookups.some((query) => query.isFetching && !query.data)
  const mutation = useMutation({
    mutationFn: (values: ProductInput) => product ? productApiClient.update(product.id, values) : productApiClient.create(values),
    retry: false,
    onSuccess: async (result) => {
      saved.current = true
      reset(initialValues(result))
      queryClient.setQueryData(['products', result.id], result)
      await queryClient.invalidateQueries({ queryKey: ['products'], exact: true })
      toast.add({ type: 'success', title: product ? 'Zmiany produktu zostały zapisane.' : 'Produkt został dodany.' })
      void navigate(`/products/${result.id}`)
    },
    onError: (error) => {
      if (error instanceof ApiError) for (const issue of error.issues) {
        if (issue.path.split('.')[0] in productSchema.shape) setError(issue.path as FieldPath<ProductInput>, { message: issue.message })
      }
    },
  })
  const blocker = useBlocker(({ currentLocation, nextLocation }) => isDirty && !saved.current && (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search))
  useEffect(() => {
    if (!isDirty || saved.current) return
    const preventClose = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', preventClose)
    return () => window.removeEventListener('beforeunload', preventClose)
  }, [isDirty])

  function field(name: FieldPath<ProductInput>, label: string, children: ReactNode, hint?: string) {
    const error = getFieldState(name, formState).error
    const errorMessage = fieldErrorMessage(error)
    return <div className="min-w-0 space-y-1.5">
      <label htmlFor={`product-${name}`} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">
        {hint}
      </p>}
      {errorMessage && <p id={`product-${name}-error`} className="text-xs text-destructive">
        {errorMessage}
      </p>}
    </div>
  }
  function input(name: FieldPath<ProductInput>, label: string, numeric = false, optional = false) {
    const error = getFieldState(name, formState).error
    return field(name, label, <Input id={`product-${name}`} type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined} max={numeric ? 9999.99 : undefined} step={numeric ? 0.01 : undefined} maxLength={name === 'customName' ? 255 : undefined}
      {...register(name, numeric ? optional ? { setValueAs: (value) => value === '' ? null : Number(value) } : { valueAsNumber: true } : optional ? { setValueAs: nullable } : {})}
      aria-invalid={Boolean(error)} aria-describedby={error ? `product-${name}-error` : undefined} />)
  }
  function select(name: 'departmentId' | 'warehouseId' | 'producerId' | 'listingTemplateId', label: string, items: { id: string; name: string }[], existing: { id: string; name: string } | undefined, readable: boolean) {
    const options = existing && !items.some((item) => item.id === existing.id) ? [existing, ...items] : items
    const error = getFieldState(name, formState).error
    return field(name, label, <NativeSelect className="w-full" id={`product-${name}`} disabled={!readable || lookupLoading} {...register(name, { onChange: () => { if (name === 'departmentId') setValue('listingTemplateId', '', { shouldDirty: true, shouldValidate: true }) } })} aria-invalid={Boolean(error)} aria-describedby={error ? `product-${name}-error` : undefined}>
      <NativeSelectOption value="">
        {lookupLoading ? 'Wczytywanie…' : 'Wybierz…'}
      </NativeSelectOption>
      {options.map((item) => <NativeSelectOption key={item.id} value={item.id}>
        {item.name}
      </NativeSelectOption>)}
    </NativeSelect>, !readable ? 'Brak uprawnień do słownika. Zachowano obecną wartość, jeśli istnieje.' : options.length === 0 && !lookupLoading ? 'Brak dostępnych pozycji. Najpierw uzupełnij słownik.' : undefined)
  }
  function textArea(name: 'internalNote' | 'customSummary' | 'customDescription', label: string, hint?: string) {
    return field(name, label, <textarea id={`product-${name}`} className={textareaClass} {...register(name, { setValueAs: nullable })} aria-invalid={Boolean(getFieldState(name, formState).error)} />, hint)
  }
  function lines(name: 'imagesUrls' | 'descriptionImagesUrls' | 'oem', label: string) {
    return field(name, label, <LinesInput name={name} />, name === 'oem' ? 'Jeden numer OEM w każdym wierszu.' : 'Jeden adres HTTP/HTTPS w każdym wierszu. Pierwsze zdjęcie produktu jest zdjęciem głównym.')
  }
  return <FormProvider {...form}>
    <div className="space-y-6">
      <PageHeader title={product ? 'Edytuj produkt' : 'Nowy produkt'} description={product ? `SKU: ${product.sku} · Zmiany zapiszesz jednym przyciskiem.` : 'Uzupełnij dane produktu, dodaj zdjęcia i przypisz pojazdy.'} actions={<FormActions layout="inline" isPending={mutation.isPending} onCancel={() => { void navigate(product ? `/products/${product.id}` : '/products') }} cancelLabel={<>
        <ArrowLeft aria-hidden="true" />Wróć</>} submitLabel={<>
          <Save aria-hidden="true" />
          {product ? 'Zapisz zmiany' : 'Dodaj produkt'}
        </>} submitDisabled={!canEdit || lookupLoading || Boolean(lookupError)} submitProps={{ form: 'product-form' }} />} />
      {formState.isSubmitted && Object.keys(formState.errors).length > 0 && <p role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">Sprawdź wyróżnione pola. Produkt nie został zapisany.</p>}
      {mutation.error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm whitespace-pre-wrap text-destructive">
        {mutation.error.message}
      </p>}
      {lookupError && <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-destructive/30 p-4 text-sm">
        <span>
          {lookupError.message}
        </span>
        <Button type="button" variant="outline" onClick={() => lookups.forEach((query) => { if (query.error) void query.refetch() })}>Ponów odczyt słowników</Button>
      </div>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        <form id="product-form" noValidate className="min-w-0" onSubmit={handleSubmit((values) => { if (canEdit && !mutation.isPending) mutation.mutate(values) })}>
          <fieldset disabled={!canEdit || mutation.isPending} className="min-w-0 space-y-5">
            <legend className="sr-only">Dane produktu</legend>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package aria-hidden="true" className="size-4 text-primary" />Podstawowe informacje</CardTitle>
                <p className="text-xs text-muted-foreground">Pola oznaczone * są wymagane. SKU jednoznacznie identyfikuje produkt.</p>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {input('sku', 'SKU *')}
                {input('customName', 'Nazwa własna', false, true)}
                {select('departmentId', 'Dział *', departments.data ?? [], product?.department, canRead(ENTITIES.DEPARTMENT))}
                {select('producerId', 'Producent *', producers.data ?? [], product?.producer, canRead(ENTITIES.PRODUCER))}
                {input('ean', 'EAN', false, true)}
                {field('side', 'Strona', <NativeSelect id="product-side" className="w-full" {...register('side')}>
                  {Object.entries(SIDE_LABELS).map(([key, label]) => <NativeSelectOption key={key} value={key}>
                    {label}
                  </NativeSelectOption>)}
                </NativeSelect>)}
                <div className="sm:col-span-2">
                  {lines('oem', 'Numery OEM')}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Boxes aria-hidden="true" className="size-4 text-primary" />Cena i magazyn</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {input('price', 'Cena (PLN) *', true)}
                {select('warehouseId', 'Magazyn *', warehouses.data ?? [], product?.warehouse, canRead(ENTITIES.WAREHOUSE))}
                {input('warehouseLocation', 'Lokalizacja w magazynie *')}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale aria-hidden="true" className="size-4 text-primary" />Wymiary i waga</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {input('weight', 'Waga (kg) *', true)}
                {input('length', 'Długość (cm) *', true)}
                {input('width', 'Szerokość (cm) *', true)}
                {input('height', 'Wysokość (cm)', true, true)}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <ProductFitmentsEditor original={product?.productFitments ?? []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon aria-hidden="true" className="size-4 text-primary" />Zdjęcia</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {lines('imagesUrls', 'Zdjęcia produktu')}
                {lines('descriptionImagesUrls', 'Zdjęcia do opisu')}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Treść i szablon ogłoszenia</CardTitle>
                <p className="text-xs text-muted-foreground">Wybierz szablon przypisany do działu. Puste pola własnego skrótu i opisu korzystają z treści szablonu.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {select('listingTemplateId', 'Szablon ogłoszenia *', (templates.data ?? []).filter((template) => template.department.id === departmentId), product?.department.id === departmentId ? product.listingTemplate : undefined, canRead(ENTITIES.PRODUCT_LISTING_TEMPLATE))}
                {textArea('customSummary', 'Własny skrót', 'Opcjonalnie: tekst lub podstawowy HTML.')}
                {textArea('customDescription', 'Własny opis', 'Opcjonalnie: tekst lub podstawowy HTML.')}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notatka wewnętrzna</CardTitle>
                <p className="text-xs text-muted-foreground">Informacja dla zespołu, niewykorzystywana w ogłoszeniu.</p>
              </CardHeader>
              <CardContent>
                {textArea('internalNote', 'Notatka')}
              </CardContent>
            </Card>
          </fieldset>
          <div className="mt-5 flex justify-end">
            <FormActions layout="inline" isPending={mutation.isPending} submitDisabled={!canEdit || lookupLoading || Boolean(lookupError)} submitLabel={<>
              <Save aria-hidden="true" />
              {product ? 'Zapisz zmiany' : 'Dodaj produkt'}
            </>} />
          </div>
        </form>
        <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Twój produkt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProductImage src={images[0]} alt="Zdjęcie główne produktu" className="aspect-square w-full rounded-xl" />
              <p className="font-medium break-words">
                {customName || product?.sku || 'Nowy produkt'}
              </p>
              <p className="text-2xl font-semibold tabular-nums">
                {Number.isFinite(price) ? formatPrice(price) : '—'}
              </p>
              <p className="border-t pt-3 text-xs text-muted-foreground">
                {isDirty ? 'Masz niezapisane zmiany.' : product ? 'Dane zgodne z ostatnim zapisem.' : 'Produkt pojawi się w katalogu po zapisaniu.'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Integracje</CardTitle>
              <p className="text-xs text-muted-foreground">Aktualne powiązania z ofertami zewnętrznymi.</p>
            </CardHeader>
            <CardContent>
              <ProductIntegrations listings={product?.externalListings ?? []} compact />
              <p className="mt-3 text-xs text-muted-foreground">Przypisanie pojazdów do poszczególnych ofert jest niezależne od listy dopasowań produktu.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
      <ConfirmDialog open={blocker.state === 'blocked'} title="Odrzucić niezapisane zmiany?" description="Dane produktu nie zostały jeszcze zapisane." confirmLabel="Odrzuć zmiany" variant="destructive" isPending={mutation.isPending} onOpenChange={(open) => { if (!open && blocker.state === 'blocked') blocker.reset() }} onConfirm={() => { if (blocker.state === 'blocked') blocker.proceed() }} />
    </div>
  </FormProvider>
}
