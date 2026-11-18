import { useMutation, useQueryClient } from '@tanstack/react-query'
import { producerApiClient } from '@/api/producers/ProducerApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { Producer } from '@/types/producers/producer.types'

export function ProducerDeleteDialog({ producer, onClose }: {
  producer: Producer
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => producerApiClient.remove(producer.id),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['producers'] })
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
      title={`Usunąć „${producer.name}”?`}
      description="Producenta można usunąć tylko wtedy, gdy nie jest przypisany do produktów."
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => mutation.mutate()}
    />
  )
}
