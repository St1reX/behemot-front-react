import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { prestashopApiClient } from '@/api/integrations/prestashop/PrestashopApiClient'
import prestashopLogo from '@/assets/images/presta-logo.png'
import { FormActions } from '@/components/common/FormActions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { prestashopConfigurationSchema } from '@/types/integrations/prestashop/prestashop.schema'
import type { PrestashopConfigurationInput } from '@/types/integrations/prestashop/prestashop.schema'

export function PrestashopConfigurationDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PrestashopConfigurationInput>({
    resolver: zodResolver(prestashopConfigurationSchema),
    defaultValues: { baseUrl: '', apiKey: '' },
  })
  const mutation = useMutation({
    mutationFn: (input: PrestashopConfigurationInput) => prestashopApiClient.createConfiguration(input),
    gcTime: 0,
    retry: false,
    onSuccess: async () => {
      reset()
      await queryClient.invalidateQueries({ queryKey: ['integrations'] })
      toast.add({ type: 'success', title: 'Sklep PrestaShop został połączony.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <img src={prestashopLogo} alt="PrestaShop" className="h-16 w-40 object-contain" />
          <DialogTitle>Dodaj sklep PrestaShop</DialogTitle>
          <DialogDescription>Podaj adres sklepu i klucz API z włączonym uprawnieniem GET do zasobu shops.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => { if (!mutation.isPending) mutation.mutate(values) })}>
          <div className="grid gap-2">
            <label htmlFor="prestashop-url" className="text-sm font-medium">Adres API</label>
            <Input id="prestashop-url" type="url" placeholder="https://moj-sklep.pl" autoComplete="url" maxLength={2048}
              disabled={mutation.isPending} aria-invalid={Boolean(errors.baseUrl)}
              aria-describedby={errors.baseUrl ? 'prestashop-url-help prestashop-url-error' : 'prestashop-url-help'} {...register('baseUrl')} />
            <p id="prestashop-url-help" className="text-xs text-muted-foreground">Podaj adres HTTPS. Możesz wskazać podkatalog sklepu lub adres kończący się na /api/.</p>
            {errors.baseUrl && <p id="prestashop-url-error" className="text-xs text-destructive">{errors.baseUrl.message}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="prestashop-key" className="text-sm font-medium">Klucz API</label>
            <Input id="prestashop-key" type="password" autoComplete="new-password" autoCapitalize="none" autoCorrect="off" spellCheck={false}
              maxLength={128} disabled={mutation.isPending} aria-invalid={Boolean(errors.apiKey)}
              aria-describedby={errors.apiKey ? 'prestashop-key-help prestashop-key-error' : 'prestashop-key-help'} {...register('apiKey')} />
            <p id="prestashop-key-help" className="text-xs text-muted-foreground">Klucz zostanie zapisany w zaszyfrowanej postaci.</p>
            {errors.apiKey && <p id="prestashop-key-error" className="text-xs text-destructive">{errors.apiKey.message}</p>}
          </div>
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Sprawdzimy połączenie i pobierzemy dane pierwszego sklepu zwróconego przez API.</p>
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} submitLabel="Połącz sklep" pendingLabel="Łączenie z PrestaShop…" />
        </form>
      </DialogContent>
    </Dialog>
  )
}
