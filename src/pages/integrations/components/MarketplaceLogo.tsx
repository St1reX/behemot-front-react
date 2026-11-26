import erliLogo from '@/assets/images/erli-logo.png'
import emagLogo from '@/assets/images/emag-logo.png'
import prestashopLogo from '@/assets/images/presta-logo.png'
import allegroLogo from '@/assets/images/allegro-logo.png'
import type { MarketplaceIntegrationChannel } from '@/types/integrations/integration.types'
import { Store } from 'lucide-react'

export function MarketplaceLogo({ channel, className }: { channel: MarketplaceIntegrationChannel; className?: string }) {
  switch (channel) {
    case 'ALLEGRO':
      return <img src={allegroLogo} alt="Allegro" className={className} />
    case 'ERLI':
      return <img src={erliLogo} alt="ERLI" className={className} />
    case 'EMAG':
      return <img src={emagLogo} alt="eMAG" className={className} />
    case 'PRESTASHOP':
      return <img src={prestashopLogo} alt="PrestaShop" className={className} />
    default:
      return <Store aria-hidden="true" className={className} />
  }
}
