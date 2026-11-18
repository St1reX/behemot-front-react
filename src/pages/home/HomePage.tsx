import { Activity, CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { BolmaStatusCard } from './components/BolmaStatusCard'
import { DashboardPlaceholders, IndicatorPlaceholder } from './components/DashboardPlaceholders'

export function HomePage() {
  const username = useAuthStore((state) => state.user?.username)
  const [today] = useState(() => new Date())

  return (
    <div className="@container/dashboard space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Panel główny</p>
          <h1 className="text-3xl font-semibold wrap-anywhere sm:text-4xl">Cześć, {username}.</h1>
          <p className="text-sm text-muted-foreground">Dobrze Cię widzieć. Oto przegląd Twojego Behemota.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4" />
          {new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(today)}
        </div>
      </div>

      <section aria-labelledby="service-status-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="service-status-title" className="text-lg font-semibold tracking-normal">Status usług</h2>
            <p className="mt-1 text-sm text-muted-foreground">Twoje katalogi i integracje w jednym miejscu.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity aria-hidden="true" className="size-3.5" />
            Odświeżanie co 30 s
          </span>
        </div>
        <div className="grid gap-5 @2xl/dashboard:grid-cols-2 @4xl/dashboard:grid-cols-3">
          <BolmaStatusCard />
          <IndicatorPlaceholder />
          <IndicatorPlaceholder />
        </div>
      </section>

      <DashboardPlaceholders />
    </div>
  )
}
