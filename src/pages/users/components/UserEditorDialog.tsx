import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Controller, useForm } from 'react-hook-form'
import { userApiClient } from '@/api/users/UserApiClient'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/stores/auth.store'
import { createUserSchema, userSchema } from '@/types/users/user.schema'
import type { UserInput } from '@/types/users/user.schema'
import type { ManagedUser } from '@/types/users/user.types'

export function UserEditorDialog({ user, onClose }: { user: ManagedUser | null; onClose: () => void }) {
  const queryClient = useQueryClient()
  const ownId = useAuthStore((state) => state.user?.id)
  const isOwn = user?.id === ownId
  const options = useQuery({
    queryKey: ['user-form-options'],
    queryFn: ({ signal }) => userApiClient.formOptions(signal),
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  })
  const { register, control, handleSubmit, formState: { errors } } = useForm<UserInput>({
    resolver: zodResolver(user ? userSchema : createUserSchema),
    defaultValues: {
      username: user?.username ?? '', email: user?.email ?? '', password: '',
      roleId: user?.roleId ?? '', departmentId: user?.departmentId ?? '', isActive: user?.isActive ?? true,
    },
  })
  const mutation = useMutation({
    mutationFn: (values: UserInput) => user ? userApiClient.update(user.id, values) : userApiClient.create(values),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] })
      if (isOwn) await useAuthStore.getState().refreshSession()
      toast.add({ type: 'success', title: 'Użytkownik został zapisany.' })
      onClose()
    },
  })
  const fields = [
    { name: 'username', label: 'Nazwa użytkownika', type: 'text', maxLength: 25, autoComplete: 'off' },
    { name: 'email', label: 'Adres e-mail', type: 'email', maxLength: undefined, autoComplete: 'off' },
    ...(!user ? [{ name: 'password' as const, label: 'Hasło', type: 'password', maxLength: undefined, autoComplete: 'new-password' }] : []),
  ] as const

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{user ? 'Edytuj użytkownika' : 'Dodaj użytkownika'}</DialogTitle>
          <DialogDescription>
            {user ? 'Zmień dane, rolę, dział lub status konta.' : 'Ustaw dane i hasło konta. Aktywne konto może od razu się zalogować.'}
          </DialogDescription>
        </DialogHeader>
        {options.error ? (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-destructive">{options.error.message}</p>
            <Button type="button" variant="outline" disabled={options.isFetching} onClick={() => { void options.refetch() }}>Ponów odczyt</Button>
          </div>
        ) : options.isPending ? (
          <div role="status" className="space-y-4"><span className="sr-only">Wczytywanie ról i działów…</span><Skeleton className="h-64 w-full" /></div>
        ) : (
          <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
            {fields.map((field) => (
              <div key={field.name} className="grid gap-2">
                <label htmlFor={`user-${field.name}`} className="text-sm font-medium">{field.label}</label>
                <Input id={`user-${field.name}`} type={field.type} maxLength={field.maxLength} autoComplete={field.autoComplete}
                  disabled={mutation.isPending} aria-invalid={Boolean(errors[field.name])}
                  aria-describedby={errors[field.name] ? `user-${field.name}-error` : undefined} {...register(field.name)} />
                {errors[field.name] && <p id={`user-${field.name}-error`} className="text-xs text-destructive">{errors[field.name]?.message}</p>}
              </div>
            ))}
            <div className="grid gap-2">
              <label htmlFor="user-role" className="text-sm font-medium">Rola</label>
              <Controller name="roleId" control={control} render={({ field }) => (
                <NativeSelect id="user-role" className="w-full" {...field} disabled={mutation.isPending || isOwn}
                  aria-invalid={Boolean(errors.roleId)} aria-describedby={errors.roleId ? 'user-role-error' : undefined}>
                  <NativeSelectOption value="">Wybierz rolę</NativeSelectOption>
                  {user && !options.data.roles.some(({ id }) => id === user.roleId) && <NativeSelectOption value={user.roleId} disabled>{user.role.name} (usunięta)</NativeSelectOption>}
                  {options.data.roles.map((role) => <NativeSelectOption key={role.id} value={role.id}>{role.name}</NativeSelectOption>)}
                </NativeSelect>
              )} />
              {errors.roleId && <p id="user-role-error" className="text-xs text-destructive">{errors.roleId.message}</p>}
            </div>
            <div className="grid gap-2">
              <label htmlFor="user-department" className="text-sm font-medium">Dział</label>
              <NativeSelect id="user-department" className="w-full" disabled={mutation.isPending}
                aria-invalid={Boolean(errors.departmentId)} {...register('departmentId')}>
                <NativeSelectOption value="">Bez działu</NativeSelectOption>
                {user?.department && !options.data.departments.some(({ id }) => id === user.departmentId) && <NativeSelectOption value={user.department.id} disabled>{user.department.name} (usunięty)</NativeSelectOption>}
                {options.data.departments.map((department) => <NativeSelectOption key={department.id} value={department.id}>{department.name}</NativeSelectOption>)}
              </NativeSelect>
              {errors.departmentId && <p className="text-xs text-destructive">Wybierz prawidłowy dział.</p>}
            </div>
            <Controller name="isActive" control={control} render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox id="user-active" name={field.name} ref={field.ref} onBlur={field.onBlur} checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)} disabled={mutation.isPending || isOwn} />
                <label htmlFor="user-active" className="text-sm font-medium">Konto aktywne</label>
              </div>
            )} />
            {isOwn && <p className="text-xs text-muted-foreground">Nie możesz zmienić własnej roli ani dezaktywować swojego konta.</p>}
            {mutation.error && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Anuluj</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Zapisywanie…' : 'Zapisz'}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
