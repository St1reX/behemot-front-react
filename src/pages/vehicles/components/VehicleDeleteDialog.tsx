import { useMutation, useQueryClient } from '@tanstack/react-query'
import { vehicleApiClient } from '@/api/vehicles/VehicleApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { VehicleRecord } from '@/types/vehicles/vehicle.types'
import { getVehicleLabel } from '../vehicle.utils'

export function VehicleDeleteDialog({ record, onClose }: {
  record: VehicleRecord
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => {
      switch (record.type) {
        case 'brand': return vehicleApiClient.brands.remove(record.item.id)
        case 'model': return vehicleApiClient.models.remove(record.item.id)
        case 'generation': return vehicleApiClient.generations.remove(record.item.id)
      }
    },
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.add({ type: 'success', title: 'Element został usunięty.' })
      onClose()
    },
  })

  return (
    <ConfirmDialog
      open
      variant="destructive"
      confirmLabel="Usuń"
      pendingLabel="Usuwanie…"
      title={`Usunąć „${getVehicleLabel(record)}”?`}
      description={record.type === 'brand'
        ? 'Markę można usunąć tylko wtedy, gdy nie ma przypisanych modeli.'
        : record.type === 'model'
          ? 'Model można usunąć tylko wtedy, gdy nie ma przypisanych generacji.'
          : 'Generację można usunąć tylko wtedy, gdy nie jest przypisana do produktów.'}
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => mutation.mutate()}
    />
  )
}
