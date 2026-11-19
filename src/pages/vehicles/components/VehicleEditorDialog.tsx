import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { vehicleApiClient } from '@/api/vehicles/VehicleApiClient'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { generationYearsSchema, vehicleNameSchema } from '@/types/vehicles/vehicle.schema'
import type { GenerationYearsInput, VehicleNameInput } from '@/types/vehicles/vehicle.schema'
import type { CarGenerationInput, CarModelInput, VehicleEditorState } from '@/types/vehicles/vehicle.types'

type SaveRequest =
  | { type: 'brand'; id?: string; data: VehicleNameInput }
  | { type: 'model'; id?: string; data: CarModelInput }
  | { type: 'generation'; id?: string; data: CarGenerationInput }

interface FormActionsProps {
  isPending: boolean
  error: string | undefined
  onCancel: () => void
}

function FormActions({ isPending, error, onCancel }: FormActionsProps) {
  return (
    <>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Anuluj</Button>
        <Button type="submit" disabled={isPending}>{isPending ? 'Zapisywanie…' : 'Zapisz'}</Button>
      </DialogFooter>
    </>
  )
}

function NameForm({ initialName, onSubmit, ...actions }: FormActionsProps & {
  initialName: string
  onSubmit: (values: VehicleNameInput) => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<VehicleNameInput>({
    resolver: zodResolver(vehicleNameSchema),
    defaultValues: { name: initialName },
  })

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label htmlFor="vehicle-name" className="text-sm font-medium">Nazwa</label>
        <Input
          id="vehicle-name"
          maxLength={100}
          disabled={actions.isPending}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'vehicle-name-error' : undefined}
          {...register('name')}
        />
        {errors.name && <p id="vehicle-name-error" className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <FormActions {...actions} />
    </form>
  )
}

function GenerationForm({ initialValues, onSubmit, ...actions }: FormActionsProps & {
  initialValues: GenerationYearsInput
  onSubmit: (values: GenerationYearsInput) => void
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<GenerationYearsInput>({
    resolver: zodResolver(generationYearsSchema),
    defaultValues: initialValues,
  })

  return (
    <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <label htmlFor="production-start" className="text-sm font-medium">Początek produkcji</label>
        <Input
          id="production-start"
          type="number"
          min={1886}
          step={1}
          disabled={actions.isPending}
          aria-invalid={Boolean(errors.startProduction)}
          aria-describedby={errors.startProduction ? 'production-start-error' : undefined}
          {...register('startProduction', { valueAsNumber: true })}
        />
        {errors.startProduction && <p id="production-start-error" className="text-xs text-destructive">{errors.startProduction.message}</p>}
      </div>
      <div className="grid gap-2">
        <label htmlFor="production-end" className="text-sm font-medium">Koniec produkcji</label>
        <Input
          id="production-end"
          type="number"
          min={1886}
          step={1}
          disabled={actions.isPending}
          aria-invalid={Boolean(errors.endProduction)}
          aria-describedby="production-end-hint production-end-error"
          {...register('endProduction', { setValueAs: (value: string) => value === '' ? null : Number(value) })}
        />
        <p id="production-end-hint" className="text-xs text-muted-foreground">Pozostaw puste, jeśli produkcja nadal trwa.</p>
        <p id="production-end-error" className="text-xs text-destructive">{errors.endProduction?.message}</p>
      </div>
      <FormActions {...actions} />
    </form>
  )
}

export function VehicleEditorDialog({ editor, onClose }: {
  editor: VehicleEditorState
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [currentYear] = useState(() => new Date().getFullYear())
  const mutation = useMutation({
    mutationFn: async (request: SaveRequest): Promise<void> => {
      switch (request.type) {
        case 'brand':
          if (request.id) await vehicleApiClient.brands.update(request.id, request.data)
          else await vehicleApiClient.brands.create(request.data)
          break
        case 'model':
          if (request.id) await vehicleApiClient.models.update(request.id, request.data)
          else await vehicleApiClient.models.create(request.data)
          break
        case 'generation':
          if (request.id) await vehicleApiClient.generations.update(request.id, request.data)
          else await vehicleApiClient.generations.create(request.data)
      }
    },
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.add({ type: 'success', title: 'Zmiany zostały zapisane.' })
      onClose()
    },
  })
  const titles = {
    brand: ['Dodaj markę', 'Edytuj markę'],
    model: ['Dodaj model', 'Edytuj model'],
    generation: ['Dodaj generację', 'Edytuj generację'],
  }
  const description = editor.type === 'brand'
    ? 'Marka jest pierwszym poziomem katalogu pojazdów.'
    : editor.type === 'model'
      ? `Marka: ${editor.carBrand.name}. Model zostanie przypisany do tej marki.`
      : `Marka: ${editor.carModel.carBrand.name} · Model: ${editor.carModel.name}.`
  const actions: FormActionsProps = {
    isPending: mutation.isPending,
    error: mutation.error?.message,
    onCancel: onClose,
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{titles[editor.type][editor.item ? 1 : 0]}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {editor.type === 'generation' ? (
          <GenerationForm
            {...actions}
            initialValues={{
              startProduction: editor.item?.startProduction ?? currentYear,
              endProduction: editor.item?.endProduction ?? null,
            }}
            onSubmit={(values) => mutation.mutate({
              type: 'generation',
              id: editor.item?.id,
              data: { ...values, carModelId: editor.carModel.id },
            })}
          />
        ) : (
          <NameForm
            {...actions}
            initialName={editor.item?.name ?? ''}
            onSubmit={(values) => {
              if (editor.type === 'brand') {
                mutation.mutate({ type: 'brand', id: editor.item?.id, data: values })
              } else {
                mutation.mutate({
                  type: 'model',
                  id: editor.item?.id,
                  data: { ...values, carBrandId: editor.carBrand.id },
                })
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
