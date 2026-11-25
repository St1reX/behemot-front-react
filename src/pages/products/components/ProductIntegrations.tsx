import { CircleCheck, CircleDashed, Clock3, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IntegrationChannel, ProductExternalListing } from '@/types/products/product.types'
import { CHANNEL_LABELS } from '../product.constants'

export function ProductIntegrations({ listings, contentVersion, isLegacy, compact = false }: { listings: ProductExternalListing[]; contentVersion: number; isLegacy: boolean; compact?: boolean }) {
  return <div className={cn('grid gap-3 sm:grid-cols-3', compact && 'flex flex-wrap gap-1.5')}>
    {(Object.keys(CHANNEL_LABELS) as IntegrationChannel[]).map((channel) => {
      const offers = listings.filter((listing) => listing.channel === channel)
      const published = offers.filter((listing) => listing.externalId).length
      const failed = offers.some((listing) => listing.syncStatus === 'FAILED')
      const synced = !isLegacy && offers.length > 0 && offers.every((listing) => Boolean(listing.externalId) && listing.syncStatus === 'SYNCED' && listing.lastSyncedContentVersion === contentVersion)
      const pending = !isLegacy && offers.length > 0 && !failed && !synced
      const Icon = failed ? TriangleAlert : pending ? Clock3 : synced ? CircleCheck : CircleDashed
      const label = isLegacy && offers.length ? 'Oferty z importu — zarządzanie nieprzejęte' : failed ? 'Błąd synchronizacji' : pending ? 'Oczekuje na synchronizację' : synced ? 'Zsynchronizowano' : offers.length ? 'Bez identyfikatora oferty' : 'Brak ofert'
      return <div key={channel} title={`${CHANNEL_LABELS[channel]}: ${label}; oferty zewnętrzne: ${published} / ${offers.length}`} className={cn(
        'min-w-0 rounded-xl border bg-muted/20 p-4',
        compact && 'flex items-center gap-1 rounded-md px-2 py-1 text-[11px]',
        failed ? 'border-destructive/25 text-destructive' : offers.length ? 'border-primary/25 text-primary' : 'text-muted-foreground',
      )}>
        {compact && <span className="sr-only">{label}. Oferty z identyfikatorem: {published} z {offers.length}.</span>}
        <div className="flex items-center gap-2">
          <Icon aria-hidden="true" className={compact ? 'size-3' : 'size-4'} />
          <span className="font-medium">
            {CHANNEL_LABELS[channel]}
          </span>
          {compact && published > 0 && <span>
            {published}
          </span>}
        </div>
        {!compact && <>
          <p className="mt-3 text-sm font-medium">
            {label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {published} wystawionych · {offers.length} powiązań</p>
          {offers.map((listing) => <div key={listing.id} className="mt-3 border-t pt-2 text-xs text-muted-foreground">
            <p>Konto: {listing.integration.name}</p>
            <p className="break-all">ID: {listing.externalId ?? 'Jeszcze nie nadano'}
            </p>
            {listing.lastSyncedAt && <p className="mt-1">Synchronizacja: {new Date(listing.lastSyncedAt).toLocaleString('pl-PL')}
            </p>}
            {listing.lastError && <p className="mt-1 whitespace-pre-wrap break-words text-destructive">
              {listing.lastError}
            </p>}
          </div>)}
        </>}
      </div>
    })}
  </div>
}
