import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { emagApiClient } from '@/api/integrations/emag/EmagApiClient'
import { FormActions } from '@/components/common/FormActions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { emagConfigurationSchema, emagMarketSchema } from '@/types/integrations/emag/emag.schema'
import type { EmagConfigurationInput } from '@/types/integrations/emag/emag.schema'
import { MarketplaceLogo } from '../MarketplaceLogo'
import { EmagMarketLabel } from './EmagMarketLabel'

export function EmagConfigurationDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EmagConfigurationInput>({
    resolver: zodResolver(emagConfigurationSchema),
    defaultValues: { baseUrl: '', market: 'RO', username: '', password: '' },
  })
  const selectedMarket = watch('market')
  const mutation = useMutation({
    mutationFn: (input: EmagConfigurationInput) => emagApiClient.createConfiguration(input),
    gcTime: 0,
    retry: false,
    onSuccess: async () => {
      reset()
      await queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.add({ type: 'success', title: 'Konto eMAG zostało połączone.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <MarketplaceLogo channel="EMAG" className="h-16 w-40 object-contain" />
          <DialogTitle>Połącz konto eMAG</DialogTitle>
          <DialogDescription>Wybierz rynek i podaj jego adres API oraz dane konta. Każdy rynek dodajesz jako osobną integrację.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => { if (!mutation.isPending) mutation.mutate(values) })}>
          <fieldset className="grid gap-2" disabled={mutation.isPending}>
            <legend className="mb-2 text-sm font-medium">Rynek</legend>
            <div className="grid grid-cols-3 gap-2">
              {emagMarketSchema.options.map((market) => (
                <Button key={market} type="button" variant={selectedMarket === market ? 'default' : 'outline'}
                  className="h-auto min-h-9 whitespace-normal" aria-pressed={selectedMarket === market}
                  onClick={() => setValue('market', market, { shouldDirty: true, shouldValidate: true })}>
                  <EmagMarketLabel market={market} />
                </Button>
              ))}
            </div>
            {errors.market && <p role="alert" className="text-xs text-destructive">{errors.market.message}</p>}
          </fieldset>
          <div className="grid gap-2">
            <label htmlFor="emag-url" className="text-sm font-medium">Adres API</label>
            <Input id="emag-url" type="url" autoComplete="url" maxLength={2048} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.baseUrl)} aria-describedby={errors.baseUrl ? 'emag-url-error' : undefined} {...register('baseUrl')} />
            {errors.baseUrl && <p id="emag-url-error" className="text-xs text-destructive">{errors.baseUrl.message}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="emag-username" className="text-sm font-medium">Adres e-mail</label>
            <Input id="emag-username" type="email" autoComplete="off" maxLength={255} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'emag-username-error' : undefined} {...register('username')} />
            {errors.username && <p id="emag-username-error" className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="emag-password" className="text-sm font-medium">Hasło</label>
            <Input id="emag-password" type="password" autoComplete="new-password" maxLength={4096} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'emag-password-error' : undefined} {...register('password')} />
            {errors.password && <p id="emag-password-error" className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Użytkownik musi mieć uprawnienia API, a adres IP naszego serwera musi być dozwolony w eMAG. Hasło zapisujemy w zaszyfrowanej postaci.</p>
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} submitLabel="Połącz konto" pendingLabel="Łączenie z eMAG…" />
        </form>
      </DialogContent>
    </Dialog>
  )
}
