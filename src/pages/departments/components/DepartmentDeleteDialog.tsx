import { useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentApiClient } from '@/api/departments/DepartmentApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/lib/toast'
import type { Department } from '@/types/departments/department.types'

export function DepartmentDeleteDialog({ department, onClose }: {
  department: Department
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => departmentApiClient.remove(department.id),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departments'] })
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
      title={`Usunąć „${department.name}”?`}
      description="Dział można usunąć tylko wtedy, gdy nie jest przypisany do produktów ani szablonów ogłoszeń."
      isPending={mutation.isPending}
      error={mutation.error?.message}
      onOpenChange={(open) => { if (!open) onClose() }}
      onConfirm={() => mutation.mutate()}
    />
  )
}
