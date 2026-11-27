import type { ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Database, RefreshCw } from 'lucide-react'
import { marketplaceIntegrationApiClient } from '@/api/marketplaceIntegrations/MarketplaceIntegrationApiClient'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAccess } from '@/hooks/useAccess'
import { toast } from '@/lib/toast'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import {
  INTEGRATION_ENVIRONMENTS,
  MARKETPLACE_INTEGRATION_CHANNELS,
  MARKETPLACE_INTEGRATION_CHANNEL_LABELS,
  MARKETPLACE_INTEGRATION_STATUS_LABELS,
} from '@/shared/constants/marketplaceIntegrations'
import type { BolmaIntegration } from '@/types/bolma/bolma.types'
import type { MarketplaceIntegration } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'
import { MarketplaceLogo } from './MarketplaceLogo'
import { EmagMarketLabel } from './emag/EmagMarketLabel'

export type SelectedIntegration =
  | { kind: 'bolma'; integration: BolmaIntegration }
  | { kind: 'marketplace'; integration: MarketplaceIntegration }

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="wrap-anywhere text-sm font-medium">{children ?? '—'}</dd>
    </div>
  )
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('pl-PL') : 'Brak danych'
}

export function IntegrationDetailsDialog({ selected, onClose, onUpdated, onReconnect }: {
  selected: SelectedIntegration
  onClose: () => void
  onUpdated: (integration: MarketplaceIntegration) => void
  onReconnect: (integration: MarketplaceIntegration) => void
}) {
  const marketplace = selected.kind === 'marketplace' ? selected.integration : null
  const queryClient = useQueryClient()
  const { requirePrivilege } = useAccess()
  const canCheck = Boolean(marketplace) && requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.UPDATE}`)
  const mutation = useMutation({
    mutationFn: (id: string) => marketplaceIntegrationApiClient.checkConnection(id),
    retry: false,
    onSuccess: ({ integration, error }) => {
      queryClient.setQueryData<MarketplaceIntegration[]>(['marketplaceIntegrations'], (previous) =>
        previous?.map((item) => item.id === integration.id ? integration : item),
      )
      onUpdated(integration)
      toast.add({ type: error ? 'error' : 'success', title: error ? 'Nie udało się połączyć z integracją.' : 'Połączenie działa. Dane konta zostały odświeżone.' })
    },
  })
  const checkError = mutation.error?.message ?? mutation.data?.error

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto font-sans sm:max-w-2xl" showCloseButton={!mutation.isPending}>
        <DialogHeader className="pr-8">
          {marketplace ? <MarketplaceLogo channel={marketplace.channel} className="mb-2 h-16 w-40 object-contain" /> : <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database aria-hidden="true" className="size-5" />
          </div>}
          <DialogTitle>{selected.integration.name}</DialogTitle>
          <DialogDescription>
            {marketplace ? 'Szczegóły konta marketplace i ostatniej aktywności.' : 'Podstawowe źródło katalogu produktów — bezpośrednie połączenie z bazą Bolmy.'}
          </DialogDescription>
        </DialogHeader>
        {selected.kind === 'bolma' ? (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Silnik bazy">{selected.integration.engine}</Detail>
              <Detail label="Konfiguracja">{selected.integration.isConfigured ? 'Skonfigurowana' : 'Brak konfiguracji'}</Detail>
              <Detail label="Źródło konfiguracji">Środowisko serwera (.env)</Detail>
              <Detail label="Szyfrowanie połączenia SSL">{selected.integration.sslEnabled ? 'Włączone' : 'Wyłączone'}</Detail>
            </dl>
            <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Dane dostępowe pozostają na serwerze. Obecność konfiguracji nie potwierdza dostępności bazy. Ten widok nie sprawdza połączenia.
            </p>
          </>
        ) : marketplace && (
          <>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Detail label="Kanał">{MARKETPLACE_INTEGRATION_CHANNEL_LABELS[marketplace.channel]}</Detail>
              {marketplace.baseUrl && <Detail label="Adres API">{marketplace.baseUrl}</Detail>}
              <Detail label="Środowisko">{marketplace.environment === INTEGRATION_ENVIRONMENTS.SANDBOX ? 'Testowe (Sandbox)' : 'Produkcyjne'}</Detail>
              <Detail label="Identyfikator konta">{marketplace.externalAccountId}</Detail>
              <Detail label="Nazwa użytkownika">{marketplace.externalUsername}</Detail>
              <Detail label="Rynek">{marketplace.channel === MARKETPLACE_INTEGRATION_CHANNELS.EMAG ? <EmagMarketLabel market={marketplace.market} /> : marketplace.market}</Detail>
              <Detail label="Integracja">{marketplace.isEnabled ? 'Włączona' : 'Wyłączona'}</Detail>
              <Detail label="Status połączenia">{MARKETPLACE_INTEGRATION_STATUS_LABELS[marketplace.status]}</Detail>
              <Detail label="Ważność tokenu dostępu">{formatDate(marketplace.accessTokenExpiresAt)}</Detail>
              <Detail label="Ostatnie sprawdzenie połączenia">{formatDate(marketplace.lastConnectionCheckAt)}</Detail>
              <Detail label="Ostatnia udana synchronizacja">{formatDate(marketplace.lastSuccessfulSyncAt)}</Detail>
              <Detail label="Ostatni błąd">{formatDate(marketplace.lastErrorAt)}</Detail>
              <Detail label="Data dodania">{formatDate(marketplace.createdAt)}</Detail>
              <Detail label="Ostatnia aktualizacja">{formatDate(marketplace.updatedAt)}</Detail>
            </dl>
            <p className="text-xs text-muted-foreground">Widok prezentuje ostatnio zapisane dane konta. Synchronizacja ofert nie jest jeszcze dostępna.</p>
            {marketplace.channel === MARKETPLACE_INTEGRATION_CHANNELS.EMAG && <p className="text-xs text-muted-foreground">eMAG potwierdza dostęp do API przez odczyt liczby ofert. Nazwa konfiguracji pochodzi z e-maila konta; publiczne API nie udostępnia profilu sprzedawcy.</p>}
            {marketplace.channel === MARKETPLACE_INTEGRATION_CHANNELS.ALLEGRO && <p className="text-xs text-muted-foreground">Token jest odświeżany automatycznie podczas korzystania z integracji. Jeśli Allegro odrzuci token odświeżania, połącz konto ponownie.</p>}
          </>
        )}
        {checkError && <p role="alert" className="text-sm text-destructive">{checkError}</p>}
        <DialogFooter>
          <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Zamknij</Button>
          {canCheck && requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.CREATE}`) && marketplace?.channel === MARKETPLACE_INTEGRATION_CHANNELS.ALLEGRO && <Button type="button" variant="outline" disabled={mutation.isPending} onClick={() => onReconnect(marketplace)}>Połącz ponownie</Button>}
          {canCheck && marketplace && (
            <Button type="button" className="h-auto min-h-9 whitespace-normal" disabled={mutation.isPending} onClick={() => mutation.mutate(marketplace.id)}>
              <RefreshCw aria-hidden="true" className={mutation.isPending ? 'shrink-0 animate-spin motion-reduce:animate-none' : 'shrink-0'} />
              {mutation.isPending ? 'Sprawdzanie połączenia…' : 'Sprawdź połączenie i odśwież dane'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
