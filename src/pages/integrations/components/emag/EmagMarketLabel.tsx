import romaniaFlag from '@/assets/images/flags/romania-flag.png'
import bulgariaFlag from '@/assets/images/flags/bulgaria-flag.png'
import hungaryFlag from '@/assets/images/flags/hungary-flag.png'
import type { EmagMarket } from '@/types/integrations/emag/emag.schema'
import { emagMarketSchema } from '@/types/integrations/emag/emag.schema'

const markets: Record<EmagMarket, { name: string; flag: string }> = {
  RO: { name: 'Rumunia', flag: romaniaFlag },
  BG: { name: 'Bułgaria', flag: bulgariaFlag },
  HU: { name: 'Węgry', flag: hungaryFlag },
}

export function EmagMarketLabel({ market }: { market: string | null }) {
  const parsedMarket = emagMarketSchema.safeParse(market)
  if (!parsedMarket.success) return market ?? '—'
  const details = markets[parsedMarket.data]

  return (
    <span className="inline-flex items-center gap-2">
      <img src={details.flag} alt="" className="h-4 w-6 shrink-0 rounded-xs object-cover ring-1 ring-foreground/10" />
      {details.name}
    </span>
  )
}
