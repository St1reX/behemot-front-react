import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Database, FolderOpen, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { bolmaApiClient } from '@/api/bolma/BolmaApiClient'
import { marketplaceIntegrationApiClient } from '@/api/marketplaceIntegrations/MarketplaceIntegrationApiClient'
import erliLogo from '@/assets/images/erli-logo.png'
import prestashopLogo from '@/assets/images/presta-logo.png'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useAccess } from '@/hooks/useAccess'
import {
  INTEGRATION_ENVIRONMENTS,
  MARKETPLACE_INTEGRATION_CHANNELS,
  MARKETPLACE_INTEGRATION_CHANNEL_LABELS,
  MARKETPLACE_INTEGRATION_STATUS_CLASSES,
  MARKETPLACE_INTEGRATION_STATUS_LABELS,
} from '@/shared/constants/marketplaceIntegrations'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { MarketplaceIntegration } from '@/types/marketplaceIntegrations/marketplaceIntegration.types'
import { IntegrationDetailsDialog } from './components/IntegrationDetailsDialog'
import type { SelectedIntegration } from './components/IntegrationDetailsDialog'
import { ErliConfigurationDialog } from './components/erli/ErliConfigurationDialog'
import { IntegrationDeleteDialog } from './components/IntegrationDeleteDialog'
import { PrestashopConfigurationDialog } from './components/prestashop/PrestashopConfigurationDialog'
import { MarketplaceLogo } from './components/MarketplaceLogo'
import { EmagConfigurationDialog } from './components/emag/EmagConfigurationDialog'
import { AllegroConfigurationDialog } from './components/allegro/AllegroConfigurationDialog'
import { AllegroAuthorizationResult } from './components/allegro/AllegroAuthorizationResult'

export function IntegrationsPage() {
  const { requirePrivilege } = useAccess()
  const [selected, setSelected] = useState<SelectedIntegration | null>(null)
  const [erliConfigurationOpen, setErliConfigurationOpen] = useState(false)
  const [prestashopConfigurationOpen, setPrestashopConfigurationOpen] = useState(false)
  const [emagConfigurationOpen, setEmagConfigurationOpen] = useState(false)
  const [allegroConfiguration, setAllegroConfiguration] = useState<{ integration?: MarketplaceIntegration } | null>(null)
  const [deleting, setDeleting] = useState<MarketplaceIntegration | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.CREATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.DELETE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.UPDATE}`)
  const canAuthorizeAllegro = canCreate && canUpdate
  const query = useQuery({
    queryKey: ['marketplaceIntegrations'],
    queryFn: ({ signal }) => marketplaceIntegrationApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.READ}`),
    retry: false,
  })

  const bolmaQuery = useQuery({
    queryKey: ['bolma', 'configuration'],
    queryFn: ({ signal }) => bolmaApiClient.getConfiguration(signal),
    enabled: requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.READ}`),
    retry: false,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Integracje" description="Źródła danych i konta marketplace połączone z systemem." />
      <AllegroAuthorizationResult />
      <section aria-label="Dostępne integracje" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex h-16 items-center gap-4">
              <MarketplaceLogo channel="ALLEGRO" className="h-16 w-32 shrink-0 object-contain" />
              <div><h2 className="text-base font-semibold">Allegro</h2><p className="text-xs text-muted-foreground">Marketplace</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Połącz konto przez autoryzację na stronie Allegro.</p>
            {canAuthorizeAllegro ? (
              <Button type="button" variant="outline" className="w-full" onClick={() => setAllegroConfiguration({})}><Plus aria-hidden="true" />Dodaj konto Allegro</Button>
            ) : <p className="text-xs text-muted-foreground">Nie masz uprawnień do dodawania integracji.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={erliLogo} alt="ERLI" className="h-16 w-32 shrink-0 object-contain" />
              <div><h2 className="text-base font-semibold">ERLI</h2><p className="text-xs text-muted-foreground">Marketplace</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Dodaj konto sprzedawcy za pomocą tokenu API.</p>
            {canCreate ? (
              <Button type="button" variant="outline" className="w-full" onClick={() => setErliConfigurationOpen(true)}><Plus aria-hidden="true" />Dodaj konto ERLI</Button>
            ) : <p className="text-xs text-muted-foreground">Nie masz uprawnień do dodawania integracji.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={prestashopLogo} alt="PrestaShop" className="h-16 w-32 shrink-0 object-contain" />
              <div><h2 className="text-base font-semibold">PrestaShop</h2><p className="text-xs text-muted-foreground">Sklep internetowy</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Połącz własny sklep, podając jego adres i klucz API.</p>
            {canCreate ? (
              <Button type="button" variant="outline" className="w-full" onClick={() => setPrestashopConfigurationOpen(true)}><Plus aria-hidden="true" />Dodaj sklep PrestaShop</Button>
            ) : <p className="text-xs text-muted-foreground">Nie masz uprawnień do dodawania integracji.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4">
            <div className="flex h-16 items-center gap-4">
              <MarketplaceLogo channel="EMAG" className="h-16 w-32 shrink-0 object-contain" />
              <div><h2 className="text-base font-semibold">eMAG</h2><p className="text-xs text-muted-foreground">Marketplace</p></div>
            </div>
            <p className="text-sm text-muted-foreground">Wybierz rynek i podaj adres API, e-mail oraz hasło konta.</p>
            {canCreate ? (
              <Button type="button" variant="outline" className="w-full" onClick={() => setEmagConfigurationOpen(true)}><Plus aria-hidden="true" />Dodaj konto eMAG</Button>
            ) : <p className="text-xs text-muted-foreground">Nie masz uprawnień do dodawania integracji.</p>}
          </CardContent>
        </Card>
      </section>
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <ListToolbar
            isFetching={query.isFetching || bolmaQuery.isFetching}
            onRefresh={() => { void query.refetch(); void bolmaQuery.refetch() }}
            summary={query.data && <span>Konta marketplace: {query.data.length}</span>}
          />
          <div className="space-y-6 p-4 sm:p-6">
            <section aria-label="Podstawowe źródło danych">
              <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Podstawowe źródło danych</p>
              {bolmaQuery.error ? (
                <p role="alert" className="text-sm text-destructive">{bolmaQuery.error.message}</p>
              ) : bolmaQuery.isPending ? (
                <ListSkeleton message="Wczytywanie konfiguracji Bolmy…" />
              ) : bolmaQuery.data && (
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-4 rounded-xl border bg-muted/30 p-4 text-left whitespace-normal"
                  onClick={() => { if (bolmaQuery.data) setSelected({ kind: 'bolma', integration: bolmaQuery.data }) }}
                >
                  <Database aria-hidden="true" className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{bolmaQuery.data.name}</span><span className="block text-xs font-normal text-muted-foreground">Katalog produktów · MySQL</span></span>
                  <span className="text-xs text-muted-foreground">{bolmaQuery.data.isConfigured ? 'Skonfigurowana' : 'Brak konfiguracji'}</span>
                  <ChevronRight aria-hidden="true" className="shrink-0" />
                </Button>
              )}
            </section>
          </div>
          {query.error ? (
            <p role="alert" className="p-6 text-sm text-destructive">{query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.</p>
          ) : query.isPending ? (
            <ListSkeleton message="Wczytywanie integracji…" />
          ) : query.data && (
            <div className="space-y-6 p-4 sm:p-6">
              <section aria-label="Integracje marketplace">
                <p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">Marketplace</p>
                {query.data.length === 0 ? (
                  <p role="status" className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Nie dodano jeszcze żadnych integracji marketplace.</p>
                ) : (
                  <ul className="space-y-2">
                    {Object.values(MARKETPLACE_INTEGRATION_CHANNELS).map((channel) => {
                      const integrations = query.data.filter((integration) => integration.channel === channel)
                      if (!integrations.length) return null
                      return (
                        <li key={channel}>
                          <Collapsible defaultOpen className="group/channel">
                            <CollapsibleTrigger render={<Button variant="ghost" className="w-full justify-start gap-3" />}>
                              <ChevronRight aria-hidden="true" className="transition-transform group-data-open/channel:rotate-90" />
                              <FolderOpen aria-hidden="true" className="text-muted-foreground" />
                              <span>{MARKETPLACE_INTEGRATION_CHANNEL_LABELS[channel]}</span>
                              <span className="ml-auto text-xs text-muted-foreground">{integrations.length}</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <ul className="mt-1 ml-5 space-y-1 border-l pl-4">
                                {integrations.map((integration) => (
                                  <li key={integration.id} className="flex items-center gap-1">
                                    <Button variant="ghost" className="h-auto min-w-0 flex-1 justify-start gap-3 py-3 text-left whitespace-normal" onClick={() => setSelected({ kind: 'marketplace', integration })}>
                                      <MarketplaceLogo channel={integration.channel} className="h-8 w-16 shrink-0 object-contain" />
                                      <span className="min-w-0 flex-1 wrap-anywhere"><span className="block">{integration.name}</span><span className="block text-xs font-normal text-muted-foreground">{integration.externalUsername ?? integration.externalAccountId ?? 'Brak danych konta'}{integration.environment === INTEGRATION_ENVIRONMENTS.SANDBOX && ' · Sandbox'}</span></span>
                                      <span className={`shrink-0 rounded-md px-2 py-1 text-xs ${integration.isEnabled ? MARKETPLACE_INTEGRATION_STATUS_CLASSES[integration.status] : 'bg-muted text-muted-foreground'}`}>{integration.isEnabled ? MARKETPLACE_INTEGRATION_STATUS_LABELS[integration.status] : 'Wyłączona'}</span>
                                      <ChevronRight aria-hidden="true" className="shrink-0" />
                                    </Button>
                                    {canDelete && (
                                      <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" title="Usuń integrację" aria-label={`Usuń integrację ${integration.name}`} onClick={() => setDeleting(integration)}>
                                        <Trash2 aria-hidden="true" />
                                      </Button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </CollapsibleContent>
                          </Collapsible>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            </div>
          )}
        </CardContent>
      </Card>
      {selected && <IntegrationDetailsDialog selected={selected} onClose={() => setSelected(null)} onUpdated={(integration) => setSelected({ kind: 'marketplace', integration })}
        onReconnect={(integration) => { setSelected(null); setAllegroConfiguration({ integration }) }} />}
      {allegroConfiguration && canAuthorizeAllegro && <AllegroConfigurationDialog integration={allegroConfiguration.integration} onClose={() => setAllegroConfiguration(null)} />}
      {erliConfigurationOpen && canCreate && <ErliConfigurationDialog onClose={() => setErliConfigurationOpen(false)} />}
      {prestashopConfigurationOpen && canCreate && <PrestashopConfigurationDialog onClose={() => setPrestashopConfigurationOpen(false)} />}
      {emagConfigurationOpen && canCreate && <EmagConfigurationDialog onClose={() => setEmagConfigurationOpen(false)} />}
      {deleting && canDelete && <IntegrationDeleteDialog integration={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
