import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productListingTemplateApiClient } from '@/api/product-listing-templates/ProductListingTemplateApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { ProductListingTemplate } from '@/types/product-listing-templates/productListingTemplate.types'

export function ProductListingTemplateDeleteDialog({ template, onClose }: {
  template: ProductListingTemplate
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => productListingTemplateApiClient.remove(template.id),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['product-listing-templates'] })
      toast.add({ type: 'success', title: 'Szablon został usunięty.' })
      onClose()
    },
  })
  return <ConfirmDialog open variant="destructive" title={`Usunąć „${template.name}”?`}
    description="Szablon można usunąć tylko wtedy, gdy nie jest przypisany do produktów."
    confirmLabel="Usuń" pendingLabel="Usuwanie…" isPending={mutation.isPending} error={mutation.error?.message}
    onOpenChange={(open) => { if (!open) onClose() }} onConfirm={() => mutation.mutate()} />
}
