import { useMutation, useQueryClient } from '@tanstack/react-query'
import { contractorApiClient } from '@/api/contractors/ContractorApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { Contractor } from '@/types/contractors/contractor.types'

export function ContractorDeleteDialog({ contractor, onClose }: {
  contractor: Contractor
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => contractorApiClient.remove(contractor.id),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contractors'] })
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
      title={`Usunąć „${contractor.name}”?`}
      description="Kontrahenta można usunąć tylko wtedy, gdy nie ma powiązanych numerów referencyjnych produktów."
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => mutation.mutate()}
    />
  )
}
