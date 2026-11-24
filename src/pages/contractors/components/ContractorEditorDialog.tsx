import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { contractorApiClient } from '@/api/contractors/ContractorApiClient'
import { FormActions } from '@/components/common/FormActions'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { contractorSchema } from '@/types/contractors/contractor.schema'
import type { Contractor } from '@/types/contractors/contractor.types'
import type { ContractorInput } from '@/types/contractors/contractor.schema'

export function ContractorEditorDialog({ contractor, onClose }: {
  contractor: Contractor | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<ContractorInput>({
    resolver: zodResolver(contractorSchema),
    defaultValues: { name: contractor?.name ?? '' },
  })
  const mutation = useMutation({
    mutationFn: (values: ContractorInput) => contractor
      ? contractorApiClient.update(contractor.id, values)
      : contractorApiClient.create(values),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['contractors'] })
      toast.add({ type: 'success', title: 'Zmiany zostały zapisane.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{contractor ? 'Edytuj kontrahenta' : 'Dodaj kontrahenta'}</DialogTitle>
          <DialogDescription>Podaj nazwę. Maksymalnie 100 znaków.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-2">
            <label htmlFor="contractor-name" className="text-sm font-medium">Nazwa</label>
            <Input
              id="contractor-name"
              maxLength={100}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'contractor-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && <p id="contractor-name-error" className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
