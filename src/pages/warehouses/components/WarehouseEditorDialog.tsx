import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { warehouseApiClient } from '@/api/warehouses/WarehouseApiClient'
import { FormActions } from '@/components/common/FormActions'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { warehouseSchema } from '@/types/warehouses/warehouse.schema'
import type { WarehouseInput } from '@/types/warehouses/warehouse.schema'
import type { Warehouse } from '@/types/warehouses/warehouse.types'

const fields = [
  { name: 'name', label: 'Nazwa', maxLength: 100 },
  { name: 'postalCode', label: 'Kod pocztowy', maxLength: 20 },
  { name: 'city', label: 'Miejscowość', maxLength: 100 },
  { name: 'street', label: 'Ulica', maxLength: 100 },
  { name: 'buildingNumber', label: 'Numer budynku', maxLength: 20 },
] as const

export function WarehouseEditorDialog({ warehouse, onClose }: {
  warehouse: Warehouse | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<WarehouseInput>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: warehouse?.name ?? '',
      postalCode: warehouse?.postalCode ?? '',
      city: warehouse?.city ?? '',
      street: warehouse?.street ?? '',
      buildingNumber: warehouse?.buildingNumber ?? '',
    },
  })
  const mutation = useMutation({
    mutationFn: (values: WarehouseInput) => warehouse
      ? warehouseApiClient.update(warehouse.id, values)
      : warehouseApiClient.create(values),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      toast.add({ type: 'success', title: 'Zmiany zostały zapisane.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{warehouse ? 'Edytuj magazyn' : 'Dodaj magazyn'}</DialogTitle>
          <DialogDescription>Podaj nazwę i adres magazynu. Wszystkie pola są wymagane.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          {fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <label htmlFor={`warehouse-${field.name}`} className="text-sm font-medium">{field.label}</label>
              <Input
                id={`warehouse-${field.name}`}
                maxLength={field.maxLength}
                disabled={mutation.isPending}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? `warehouse-${field.name}-error` : undefined}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <p id={`warehouse-${field.name}-error`} className="text-xs text-destructive">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
