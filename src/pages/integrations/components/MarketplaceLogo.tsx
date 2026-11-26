import erliLogo from '@/assets/images/erli-logo.png'
import prestashopLogo from '@/assets/images/presta-logo.png'
import type { MarketplaceIntegrationChannel } from '@/types/integrations/integration.types'
import { Store } from 'lucide-react'

export function MarketplaceLogo({ channel, className }: { channel: MarketplaceIntegrationChannel; className?: string }) {
  switch (channel) {
    case 'ERLI':
      return <img src={erliLogo} alt="ERLI" className={className} />
    case 'PRESTASHOP':
      return <img src={prestashopLogo} alt="PrestaShop" className={className} />
    default:
      return <Store aria-hidden="true" className={className} />
  }
}
