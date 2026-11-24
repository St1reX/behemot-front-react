import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { roleApiClient } from '@/api/roles/RoleApiClient'
import { FormActions } from '@/components/common/FormActions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { roleSchema } from '@/types/roles/role.schema'
import type { RoleInput } from '@/types/roles/role.schema'
import type { Role, RoleDetails, RolePrivilege } from '@/types/roles/role.types'
import { RolePrivilegesMatrix } from './RolePrivilegesMatrix'

export function RoleEditorDialog({ role, readOnly, isOwnRole, onClose }: {
  role: Role | null
  readOnly: boolean
  isOwnRole: boolean
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const privilegesQuery = useQuery({
    queryKey: ['role-privileges'],
    queryFn: ({ signal }) => roleApiClient.privileges(signal),
    retry: false,
    refetchOnWindowFocus: false,
  })
  const detailsQuery = useQuery({
    queryKey: ['roles', role?.id],
    queryFn: ({ signal }) => roleApiClient.get(role!.id, signal),
    enabled: Boolean(role),
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const mutation = useMutation({
    mutationFn: (values: RoleInput) => role
      ? roleApiClient.update(role.id, values)
      : roleApiClient.create(values),
    retry: false,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['roles'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['user-form-options'] }),
      ])
      toast.add({ type: 'success', title: 'Rola została zapisana.' })
      onClose()
    },
  })
  const error = privilegesQuery.error ?? detailsQuery.error
  const loading = privilegesQuery.isPending || (role && detailsQuery.isPending)

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-4xl" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{readOnly ? `Uprawnienia roli „${role?.name}”` : role ? 'Edytuj rolę' : 'Dodaj rolę'}</DialogTitle>
          <DialogDescription>
            {isOwnRole
              ? 'To Twoja rola. Możesz przeglądać jej uprawnienia, ale nie możesz jej edytować.'
              : readOnly
                ? 'Podgląd uprawnień przypisanych do tej roli.'
                : 'Podaj nazwę i wybierz uprawnienia. Zmiany zostaną zapisane po kliknięciu „Zapisz”.'}
          </DialogDescription>
        </DialogHeader>
        {error ? (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-destructive">{error.message}</p>
            <Button type="button" variant="outline" disabled={privilegesQuery.isFetching || detailsQuery.isFetching} onClick={() => {
              void privilegesQuery.refetch()
              if (role) void detailsQuery.refetch()
            }}>Ponów odczyt</Button>
          </div>
        ) : loading ? (
          <div role="status" className="space-y-4">
            <span className="sr-only">Wczytywanie roli i uprawnień…</span>
            <Skeleton aria-hidden="true" className="h-8 w-1/2" />
            <Skeleton aria-hidden="true" className="h-80 w-full" />
          </div>
        ) : (
          <RoleEditorForm
            role={detailsQuery.data ?? null}
            privileges={privilegesQuery.data ?? []}
            readOnly={readOnly}
            isPending={mutation.isPending}
            error={mutation.error?.message}
            onSubmit={(values) => { if (!readOnly) mutation.mutate(values) }}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function RoleEditorForm({ role, privileges, readOnly, isPending, error, onSubmit, onClose }: {
  role: RoleDetails | null
  privileges: RolePrivilege[]
  readOnly: boolean
  isPending: boolean
  error?: string
  onSubmit: (values: RoleInput) => void
  onClose: () => void
}) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    defaultValues: { name: role?.name ?? '', privilegeIds: role?.privileges.map(({ id }) => id) ?? [] },
  })

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="grid max-w-md gap-2">
        <label htmlFor="role-name" className="text-sm font-medium">Nazwa roli</label>
        <Input
          id="role-name"
          maxLength={100}
          readOnly={readOnly}
          disabled={isPending}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'role-name-error' : undefined}
          {...register('name')}
        />
        {errors.name && <p id="role-name-error" className="text-xs text-destructive">{errors.name.message}</p>}
      </div>
      <Controller
        name="privilegeIds"
        control={control}
        render={({ field }) => <RolePrivilegesMatrix privileges={privileges} value={field.value} onChange={field.onChange} disabled={readOnly || isPending} />}
      />
      {errors.privilegeIds && <p role="alert" className="text-sm text-destructive">Nieprawidłowy wybór uprawnień. Otwórz formularz ponownie.</p>}
      <FormActions isPending={isPending} error={error} onCancel={onClose}
        cancelLabel={readOnly ? 'Zamknij' : 'Anuluj'} showSubmit={!readOnly} />
    </form>
  )
}
