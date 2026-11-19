import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Editor } from '@tiptap/core'
import { ArrowLeft, Eye, Save } from 'lucide-react'
import { useRef, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useBeforeUnload, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { departmentApiClient } from '@/api/departments/DepartmentApiClient'
import { ApiError } from '@/api/errors'
import { productListingTemplateApiClient } from '@/api/product-listing-templates/ProductListingTemplateApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAccess } from '@/hooks/useAccess'
import { toast } from '@/lib/toast'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { Department } from '@/types/departments/department.types'
import { productListingTemplateSchema } from '@/types/product-listing-templates/productListingTemplate.schema'
import type { ProductListingTemplateInput } from '@/types/product-listing-templates/productListingTemplate.schema'
import type { ListingPlaceholder, ListingTemplateField, ProductListingTemplate } from '@/types/product-listing-templates/productListingTemplate.types'
import { TemplateFieldEditor } from './components/TemplateFieldEditor'
import { TemplatePlaceholderPanel } from './components/TemplatePlaceholderPanel'
import { TemplatePreview } from './components/TemplatePreview'
import { LISTING_FIELD_LABELS } from './listingTemplate.utils'
import './listing-template.css'

export function ProductListingTemplateEditorPage() {
  const { id } = useParams()
  const { requirePrivilege } = useAccess()
  const canEdit = requirePrivilege(`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${id ? ACTIONS.UPDATE : ACTIONS.CREATE}`)
  const canReadDepartments = requirePrivilege(`${ENTITIES.DEPARTMENT}:${ACTIONS.READ}`)
  const validId = !id || z.uuid().safeParse(id).success
  const template = useQuery({
    queryKey: ['product-listing-templates', id],
    queryFn: ({ signal }) => productListingTemplateApiClient.get(id!, signal),
    enabled: Boolean(id) && validId,
    retry: false,
  })
  const placeholders = useQuery({
    queryKey: ['listing-template-placeholders'],
    queryFn: ({ signal }) => productListingTemplateApiClient.placeholders(signal),
    retry: false,
    staleTime: 5 * 60_000,
  })
  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: ({ signal }) => departmentApiClient.list(signal),
    enabled: canEdit && canReadDepartments,
    retry: false,
  })
  const error = (id && !template.data ? template.error : null)
    ?? (!placeholders.data ? placeholders.error : null)
    ?? (canEdit && canReadDepartments && !departments.data ? departments.error : null)
  const loading = (Boolean(id) && template.isPending) || placeholders.isPending
    || (canEdit && canReadDepartments && departments.isPending)

  if (!validId) return <p role="alert">Niepoprawny identyfikator szablonu.</p>
  if (error) return (
    <div className="space-y-3">
      <p role="alert" className="text-sm text-destructive">{error.message}</p>
      <Button type="button" variant="outline" onClick={() => {
        if (id) void template.refetch()
        void placeholders.refetch()
        if (canEdit && canReadDepartments) void departments.refetch()
      }}>Ponów odczyt</Button>
    </div>
  )
  if (loading || !placeholders.data) return (
    <div role="status" className="space-y-5">
      <span className="sr-only">Wczytywanie kreatora…</span>
      <Skeleton className="h-12 w-2/3" /><Skeleton className="h-96 w-full" />
    </div>
  )

  return <TemplateForm key={id ?? 'new'} template={template.data} placeholders={placeholders.data}
    departments={departments.data ?? []} canEdit={canEdit} canReadDepartments={canReadDepartments} />
}

function TemplateForm({ template, placeholders, departments, canEdit, canReadDepartments }: {
  template?: ProductListingTemplate
  placeholders: ListingPlaceholder[]
  departments: Department[]
  canEdit: boolean
  canReadDepartments: boolean
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const activeEditor = useRef<Editor | null>(null)
  const [activeField, setActiveField] = useState<ListingTemplateField | null>(null)
  const [discarding, setDiscarding] = useState(false)
  const { register, control, handleSubmit, setError, reset, formState: { errors, isDirty } } = useForm<ProductListingTemplateInput>({
    resolver: zodResolver(productListingTemplateSchema),
    defaultValues: template ? {
      name: template.name, departmentId: template.department.id,
      titleTemplate: template.titleTemplate, summaryTemplate: template.summaryTemplate, descriptionTemplate: template.descriptionTemplate,
    } : {
      name: '', departmentId: '',
      titleTemplate: '{{customName}} {{carBrand}} {{carModel}} {{productionYears}} {{sideTitleLabel}}',
      summaryTemplate: '<p><strong>{{producer}}</strong> · SKU: {{sku}}</p>',
      descriptionTemplate: '<h2>{{customName}}</h2><p>Część do pojazdu <strong>{{carGeneration}}</strong>.</p><ul><li>Producent: {{producer}}</li><li>Strona: {{sideLabel}}</li><li>SKU: {{sku}}</li></ul><p>Przed zakupem sprawdź dopasowanie części do swojego pojazdu.</p>',
    },
  })
  const [titleTemplate, summaryTemplate, descriptionTemplate] = useWatch({ control, name: ['titleTemplate', 'summaryTemplate', 'descriptionTemplate'] })
  const mutation = useMutation({
    mutationFn: (values: ProductListingTemplateInput) => template
      ? productListingTemplateApiClient.update(template.id, values)
      : productListingTemplateApiClient.create(values),
    retry: false,
    onSuccess: async (_saved, values) => {
      await queryClient.invalidateQueries({ queryKey: ['product-listing-templates'] })
      reset(values)
      toast.add({ type: 'success', title: 'Szablon został zapisany.' })
      void navigate('/listing-templates')
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        for (const issue of error.issues) {
          if (issue.path in productListingTemplateSchema.shape) {
            setError(issue.path as keyof ProductListingTemplateInput, { message: issue.message })
          }
        }
      }
    },
  })
  useBeforeUnload((event) => {
    if (canEdit && isDirty) { event.preventDefault(); event.returnValue = '' }
  })
  const disabled = !canEdit || mutation.isPending
  const departmentOptions = template && !departments.some((department) => department.id === template.department.id)
    ? [template.department, ...departments] : departments
  const noDepartmentAvailable = !template && (!canReadDepartments || departments.length === 0)

  function insertPlaceholder(name: string) {
    const editor = activeEditor.current
    if (!disabled && editor && !editor.isDestroyed) {
      editor.chain().focus().insertContent({ type: 'templateVariable', attrs: { name } }).run()
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={template ? canEdit ? 'Edytuj szablon' : 'Podgląd szablonu' : 'Nowy szablon ogłoszenia'}
        description="Połącz własną treść z danymi produktu. Zmienne zostaną uzupełnione podczas generowania ogłoszenia."
        actions={<div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => {
            if (canEdit && isDirty) setDiscarding(true)
            else void navigate('/listing-templates')
          }}><ArrowLeft aria-hidden="true" />Wróć do listy</Button>
          <Dialog>
            <DialogTrigger render={<Button type="button" variant="outline" />}>
              <Eye aria-hidden="true" />Podgląd ogłoszenia
            </DialogTrigger>
            <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-5xl">
              <DialogHeader className="pr-8">
                <DialogTitle>Podgląd ogłoszenia</DialogTitle>
                <DialogDescription>
                  Aktualna treść na przykładowych danych: Volkswagen Golf VII, 2012–2019. Wygląd ogłoszenia w portalu może się różnić.
                </DialogDescription>
              </DialogHeader>
              <TemplatePreview content={{ titleTemplate, summaryTemplate, descriptionTemplate }} />
            </DialogContent>
          </Dialog>
          {canEdit && <Button type="submit" form="listing-template-form" disabled={mutation.isPending || noDepartmentAvailable}>
            <Save aria-hidden="true" />{mutation.isPending ? 'Zapisywanie…' : 'Zapisz szablon'}
          </Button>}
        </div>}
      />
      {mutation.error && <p role="alert" className="rounded-lg border border-destructive/30 p-4 text-sm whitespace-pre-wrap text-destructive">{mutation.error.message}</p>}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <form id="listing-template-form" noValidate className="min-w-0 space-y-5" onSubmit={handleSubmit((values) => { if (canEdit && !mutation.isPending) mutation.mutate(values) })}>
          <fieldset disabled={disabled} className="grid gap-4 rounded-xl border bg-card p-5 sm:grid-cols-2">
            <legend className="sr-only">Dane szablonu</legend>
            <div className="space-y-1.5">
              <label htmlFor="template-name" className="text-sm font-medium">Nazwa szablonu</label>
              <Input id="template-name" maxLength={100} placeholder="Np. Części karoserii — standard" {...register('name')}
                aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'template-name-error' : undefined} />
              {errors.name && <p id="template-name-error" className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="template-department" className="text-sm font-medium">Dział</label>
              {canReadDepartments && canEdit ? (
                <select id="template-department" {...register('departmentId')}
                  aria-invalid={Boolean(errors.departmentId)} aria-describedby={errors.departmentId ? 'template-department-error' : undefined}
                  className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50">
                  <option value="">Wybierz dział</option>
                  {departmentOptions.map((department) => <option key={department.id} value={department.id}>{department.name} ({department.shortcut})</option>)}
                </select>
              ) : (
                <>
                  <Input id="template-department" readOnly value={template?.department.name ?? 'Brak dostępu do działów'} />
                  <input type="hidden" {...register('departmentId')} />
                </>
              )}
              {errors.departmentId && <p id="template-department-error" className="text-xs text-destructive">{errors.departmentId.message}</p>}
              {canEdit && !canReadDepartments && <p className="text-xs text-muted-foreground">Brak uprawnień do listy działów.{template ? ' Zachowano obecny dział.' : ' Do utworzenia szablonu potrzebujesz odczytu działów.'}</p>}
              {canEdit && canReadDepartments && departments.length === 0 && <p className="text-xs text-muted-foreground">Brak działów. Przed utworzeniem szablonu dodaj dział.</p>}
            </div>
          </fieldset>
          {(Object.keys(LISTING_FIELD_LABELS) as ListingTemplateField[]).map((name) => (
            <Controller key={name} name={name} control={control} render={({ field, fieldState }) => (
              <TemplateFieldEditor id={name} label={LISTING_FIELD_LABELS[name]} initialValue={field.value}
                placeholders={placeholders} richText={name !== 'titleTemplate'} disabled={disabled}
                active={activeField === name} error={fieldState.error?.message} onChange={field.onChange} onBlur={field.onBlur}
                onFocus={(editor) => { activeEditor.current = editor; setActiveField(name) }} />
            )} />
          ))}
        </form>
        <aside className="min-w-0 space-y-4 rounded-xl border bg-card p-4 xl:sticky xl:top-6" aria-label="Pomocnik szablonu">
          <TemplatePlaceholderPanel placeholders={placeholders} disabled={disabled}
            activeLabel={activeField ? LISTING_FIELD_LABELS[activeField] : null} onInsert={insertPlaceholder} />
        </aside>
      </div>
      <ConfirmDialog open={discarding} title="Odrzucić niezapisane zmiany?" description="Zmiany w tym szablonie nie zostały zapisane."
        confirmLabel="Odrzuć zmiany" variant="destructive" onOpenChange={setDiscarding} onConfirm={() => { void navigate('/listing-templates') }} />
    </div>
  )
}
