import { useMutation, useQueryClient } from '@tanstack/react-query'
import { integrationApiClient } from '@/api/integrations/IntegrationApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { MarketplaceIntegration } from '@/types/integrations/integration.types'

export function IntegrationDeleteDialog({ integration, onClose }: { integration: MarketplaceIntegration; onClose: () => void }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => integrationApiClient.remove(integration.id),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['integrations'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ])
      toast.add({ type: 'success', title: 'Integracja i powiązane oferty zostały usunięte.' })
      onClose()
    },
  })

  return (
    <ConfirmDialog
      open
      variant="destructive"
      title={`Usunąć integrację „${integration.name}”?`}
      description="Integracja, powiązane oferty zewnętrzne i ich przypisania do pojazdów zostaną usunięte z systemu."
      confirmLabel="Usuń integrację"
      pendingLabel="Usuwanie…"
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => { if (!mutation.isPending) mutation.mutate() }}
    />
  )
}
