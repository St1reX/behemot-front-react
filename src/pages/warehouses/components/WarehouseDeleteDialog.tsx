import { useMutation, useQueryClient } from '@tanstack/react-query'
import { warehouseApiClient } from '@/api/warehouses/WarehouseApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { Warehouse } from '@/types/warehouses/warehouse.types'

export function WarehouseDeleteDialog({ warehouse, onClose }: {
  warehouse: Warehouse
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => warehouseApiClient.remove(warehouse.id),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['warehouses'] })
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
      title={`Usunąć „${warehouse.name}”?`}
      description="Magazyn można usunąć tylko wtedy, gdy nie jest przypisany do produktów."
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => mutation.mutate()}
    />
  )
}
