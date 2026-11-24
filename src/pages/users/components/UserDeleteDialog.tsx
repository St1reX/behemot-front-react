import { useMutation, useQueryClient } from '@tanstack/react-query'
import { userApiClient } from '@/api/users/UserApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { ManagedUser } from '@/types/users/user.types'

export function UserDeleteDialog({ user, onClose }: { user: ManagedUser; onClose: () => void }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => userApiClient.remove(user.id),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.add({ type: 'success', title: 'Użytkownik został usunięty.' })
      onClose()
    },
  })

  return (
    <ConfirmDialog open variant="destructive" confirmLabel="Usuń" pendingLabel="Usuwanie…"
      title={`Usunąć użytkownika „${user.username}”?`}
      description="Konto utraci dostęp do aplikacji. Historia operacji pozostanie zachowana, a login i e-mail nadal będą zarezerwowane."
      isPending={mutation.isPending} error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }} onConfirm={() => mutation.mutate()} />
  )
}
