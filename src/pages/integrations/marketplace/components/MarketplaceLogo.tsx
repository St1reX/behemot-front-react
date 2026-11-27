import erliLogo from '@/assets/images/erli-logo.png'
import emagLogo from '@/assets/images/emag-logo.png'
import prestashopLogo from '@/assets/images/presta-logo.png'
import allegroLogo from '@/assets/images/allegro-logo.png'
import { MARKETPLACE_INTEGRATION_CHANNELS, type MarketplaceIntegrationChannel } from '@/constants/marketplaceIntegrations'
import { Store } from 'lucide-react'

export function MarketplaceLogo({ channel, className }: { channel: MarketplaceIntegrationChannel; className?: string }) {
  switch (channel) {
    case MARKETPLACE_INTEGRATION_CHANNELS.ALLEGRO:
      return <img src={allegroLogo} alt="Allegro" className={className} />
    case MARKETPLACE_INTEGRATION_CHANNELS.ERLI:
      return <img src={erliLogo} alt="ERLI" className={className} />
    case MARKETPLACE_INTEGRATION_CHANNELS.EMAG:
      return <img src={emagLogo} alt="eMAG" className={className} />
    case MARKETPLACE_INTEGRATION_CHANNELS.PRESTASHOP:
      return <img src={prestashopLogo} alt="PrestaShop" className={className} />
    default:
      return <Store aria-hidden="true" className={className} />
  }
}
