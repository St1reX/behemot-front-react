import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { erliApiClient } from '@/api/integrations/erli/ErliApiClient'
import erliLogo from '@/assets/images/erli-logo.png'
import { FormActions } from '@/components/common/FormActions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { erliConfigurationSchema } from '@/types/integrations/erli/erli.schema'
import type { ErliConfigurationInput } from '@/types/integrations/erli/erli.schema'

export function ErliConfigurationDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ErliConfigurationInput>({
    resolver: zodResolver(erliConfigurationSchema),
    defaultValues: { token: '' },
  })
  const mutation = useMutation({
    mutationFn: (input: ErliConfigurationInput) => erliApiClient.createConfiguration(input),
    gcTime: 0,
    retry: false,
    onSuccess: async () => {
      reset()
      await queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.add({ type: 'success', title: 'Konto ERLI zostało połączone.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <img src={erliLogo} alt="ERLI" className="h-16 w-32 object-contain" />
          <DialogTitle>Dodaj konto ERLI</DialogTitle>
          <DialogDescription>Wklej klucz API z panelu sprzedawcy ERLI: Metoda integracji → Własna integracja po API.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => { if (!mutation.isPending) mutation.mutate(values) })}>
          <div className="grid gap-2">
            <label htmlFor="erli-token" className="text-sm font-medium">Token API</label>
            <Input id="erli-token" type="password" autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              maxLength={8192} disabled={mutation.isPending} aria-invalid={Boolean(errors.token)}
              aria-describedby={errors.token ? 'erli-token-help erli-token-error' : 'erli-token-help'} {...register('token')} />
            <p id="erli-token-help" className="text-xs text-muted-foreground">Podaj sam token, bez prefiksu „Bearer”. Zostanie zapisany w zaszyfrowanej postaci.</p>
            {errors.token && <p id="erli-token-error" className="text-xs text-destructive">{errors.token.message}</p>}
          </div>
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Podczas zapisu sprawdzimy token i pobierzemy nazwę oraz identyfikator Twojego sklepu z ERLI.</p>
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} submitLabel="Połącz konto" pendingLabel="Łączenie z ERLI…" />
        </form>
      </DialogContent>
    </Dialog>
  )
}
