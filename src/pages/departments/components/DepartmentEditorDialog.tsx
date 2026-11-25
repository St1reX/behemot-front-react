import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { departmentApiClient } from '@/api/departments/DepartmentApiClient'
import { FormActions } from '@/components/common/FormActions'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { departmentSchema } from '@/types/departments/department.schema'
import type { DepartmentInput } from '@/types/departments/department.schema'
import type { Department } from '@/types/departments/department.types'

const fields = [
  { name: 'name', label: 'Nazwa', maxLength: 100 },
  { name: 'shortcut', label: 'Skrót', maxLength: 2 },
] as const

export function DepartmentEditorDialog({ department, onClose }: {
  department: Department | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name ?? '',
      shortcut: department?.shortcut ?? '',
    },
  })
  const mutation = useMutation({
    mutationFn: (values: DepartmentInput) => department
      ? departmentApiClient.update(department.id, values)
      : departmentApiClient.create(values),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['departments'] })
      toast.add({ type: 'success', title: 'Zmiany zostały zapisane.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{department ? 'Edytuj dział' : 'Dodaj dział'}</DialogTitle>
          <DialogDescription>Podaj nazwę i skrót działu. Wszystkie pola są wymagane.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          {fields.map((field) => (
            <div key={field.name} className="grid gap-2">
              <label htmlFor={`department-${field.name}`} className="text-sm font-medium">{field.label}</label>
              <Input
                id={`department-${field.name}`}
                maxLength={field.maxLength}
                disabled={mutation.isPending}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? `department-${field.name}-error` : undefined}
                {...register(field.name)}
              />
              {errors[field.name] && (
                <p id={`department-${field.name}-error`} className="text-xs text-destructive">{errors[field.name]?.message}</p>
              )}
            </div>
          ))}
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} />
        </form>
      </DialogContent>
    </Dialog>
  )
}
