import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { allegroApiClient } from '@/api/integrations/allegro/AllegroApiClient'
import { FormActions } from '@/components/common/FormActions'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { allegroAuthorizationSchema } from '@/types/integrations/allegro/allegro.schema'
import type { AllegroAuthorizationInput } from '@/types/integrations/allegro/allegro.schema'
import type { MarketplaceIntegration } from '@/types/integrations/integration.types'
import { MarketplaceLogo } from '../MarketplaceLogo'

export function AllegroConfigurationDialog({ integration, onClose }: { integration?: MarketplaceIntegration; onClose: () => void }) {
  const configuration = useQuery({
    queryKey: ['integrations', 'allegro', 'configuration'],
    queryFn: ({ signal }) => allegroApiClient.getConfiguration(signal),
    retry: false,
  })
  const { register, handleSubmit, formState: { errors } } = useForm<AllegroAuthorizationInput>({
    resolver: zodResolver(allegroAuthorizationSchema),
    defaultValues: { baseUrl: integration?.baseUrl ?? '', integrationId: integration?.id, clientId: '', clientSecret: '' },
  })
  const mutation = useMutation({
    mutationFn: (input: AllegroAuthorizationInput) => allegroApiClient.authorize(input),
    gcTime: 0,
    retry: false,
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-lg" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <MarketplaceLogo channel="ALLEGRO" className="h-16 w-40 object-contain" />
          <DialogTitle>{integration ? 'Połącz ponownie konto Allegro' : 'Połącz konto Allegro'}</DialogTitle>
          <DialogDescription>Przejdziesz na stronę Allegro, aby zalogować się i zatwierdzić dostęp do konta. Następnie wrócisz do listy integracji.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => { if (!mutation.isPending) mutation.mutate(values) })}>
          <div className="grid gap-2">
            <label htmlFor="allegro-url" className="text-sm font-medium">Adres API</label>
            <Input id="allegro-url" type="url" autoComplete="url" maxLength={2048} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.baseUrl)} aria-describedby={errors.baseUrl ? 'allegro-url-help allegro-url-error' : 'allegro-url-help'} {...register('baseUrl')} />
            <p id="allegro-url-help" className="text-xs text-muted-foreground">Podaj bazowy adres HTTPS API. Połączenie obejmuje jedno konto sprzedawcy.</p>
            {errors.baseUrl && <p id="allegro-url-error" className="text-xs text-destructive">{errors.baseUrl.message}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="allegro-client-id" className="text-sm font-medium">Client ID</label>
            <Input id="allegro-client-id" autoComplete="off" maxLength={255} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.clientId)} aria-describedby={errors.clientId ? 'allegro-client-id-error' : undefined} {...register('clientId')} />
            {errors.clientId && <p id="allegro-client-id-error" className="text-xs text-destructive">{errors.clientId.message}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="allegro-client-secret" className="text-sm font-medium">Client Secret</label>
            <Input id="allegro-client-secret" type="password" autoComplete="new-password" maxLength={4096} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.clientSecret)} aria-describedby={errors.clientSecret ? 'allegro-client-secret-error' : undefined} {...register('clientSecret')} />
            {errors.clientSecret && <p id="allegro-client-secret-error" className="text-xs text-destructive">{errors.clientSecret.message}</p>}
          </div>
          {configuration.isPending ? <p role="status" className="text-sm text-muted-foreground">Sprawdzanie konfiguracji Allegro…</p> : configuration.data && (
            <div className="grid gap-2">
              <label htmlFor="allegro-callback" className="text-sm font-medium">Adres powrotu (Redirect URI)</label>
              <Input id="allegro-callback" readOnly value={configuration.data.callbackUrl} aria-describedby="allegro-callback-help" />
              <p id="allegro-callback-help" className="text-xs text-muted-foreground">Ten adres musi być wpisany w konfiguracji aplikacji w Allegro Developer.</p>
            </div>
          )}
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            {integration ? `Zaloguj się do konta ${integration.externalUsername ?? integration.name}. ` : ''}
            Dostęp obejmuje odczyt danych konta. Dane aplikacji i tokeny zapisujemy w zaszyfrowanej postaci. Token dostępu jest odświeżany automatycznie podczas korzystania z integracji.
          </p>
          <FormActions isPending={mutation.isPending} error={mutation.error?.message ?? configuration.error?.message} onCancel={onClose}
            submitDisabled={!configuration.data} submitLabel="Przejdź do Allegro" pendingLabel="Przekierowywanie do Allegro…" />
        </form>
      </DialogContent>
    </Dialog>
  )
}
