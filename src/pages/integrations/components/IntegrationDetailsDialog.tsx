import type { ReactNode } from 'react'
import { Database, Store } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CHANNEL_LABELS } from '@/shared/constants/marketplaceIntegrations'
import type { BolmaIntegration, MarketplaceIntegration } from '@/types/integrations/integration.types'
import { STATUS_LABELS } from '../integration.constants'

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

export function IntegrationDetailsDialog({ selected, onClose }: { selected: SelectedIntegration; onClose: () => void }) {
  const marketplace = selected.kind === 'marketplace' ? selected.integration : null
  const Icon = marketplace ? Store : Database

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto font-sans sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </div>
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
              <Detail label="Kanał">{CHANNEL_LABELS[marketplace.channel]}</Detail>
              <Detail label="Środowisko">{marketplace.environment === 'SANDBOX' ? 'Testowe (Sandbox)' : 'Produkcyjne'}</Detail>
              <Detail label="Identyfikator konta">{marketplace.externalAccountId}</Detail>
              <Detail label="Nazwa użytkownika">{marketplace.externalUsername}</Detail>
              <Detail label="Rynek">{marketplace.market}</Detail>
              <Detail label="Integracja">{marketplace.isEnabled ? 'Włączona' : 'Wyłączona'}</Detail>
              <Detail label="Status połączenia">{STATUS_LABELS[marketplace.status]}</Detail>
              <Detail label="Ważność tokenu dostępu">{formatDate(marketplace.accessTokenExpiresAt)}</Detail>
              <Detail label="Ostatnie sprawdzenie połączenia">{formatDate(marketplace.lastConnectionCheckAt)}</Detail>
              <Detail label="Ostatnia udana synchronizacja">{formatDate(marketplace.lastSuccessfulSyncAt)}</Detail>
              <Detail label="Ostatni błąd">{formatDate(marketplace.lastErrorAt)}</Detail>
              <Detail label="Data dodania">{formatDate(marketplace.createdAt)}</Detail>
              <Detail label="Ostatnia aktualizacja">{formatDate(marketplace.updatedAt)}</Detail>
            </dl>
            <p className="text-xs text-muted-foreground">Widok prezentuje dane zapisane w systemie. Obsługa połączeń i synchronizacji zostanie dodana w kolejnym etapie.</p>
          </>
        )}
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
