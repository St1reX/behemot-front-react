import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roleApiClient } from '@/api/roles/RoleApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { Role } from '@/types/roles/role.types'

export function RoleDeleteDialog({ role, onClose }: {
  role: Role
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => roleApiClient.remove(role.id),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roles'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['user-form-options'] }),
      ])
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
      title={`Usunąć „${role.name}”?`}
      description="Rolę można usunąć tylko wtedy, gdy nie jest przypisana do użytkowników."
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => mutation.mutate()}
    />
  )
}
