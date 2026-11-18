import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function IndicatorPlaceholder() {
  return (
    <Card className="gap-5 shadow-none [--card-spacing:--spacing(5)]">
      <span className="sr-only">Miejsce na kolejny wskaźnik. W przygotowaniu.</span>
      <CardHeader aria-hidden="true" className="flex items-center gap-3">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-28 max-w-full" />
          <Skeleton className="h-3 w-20 max-w-full" />
        </div>
      </CardHeader>
      <CardContent aria-hidden="true">
        <div className="min-h-25 space-y-3">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPlaceholders() {
  return (
    <section aria-label="Pozostałe sekcje — w przygotowaniu" className="grid gap-5 @4xl/dashboard:grid-cols-7">
      <Card className="shadow-none @4xl/dashboard:col-span-4 [--card-spacing:--spacing(5)]">
        <CardHeader className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-normal">Przegląd katalogu</h2>
          <span className="text-xs text-muted-foreground">W przygotowaniu</span>
        </CardHeader>
        <CardContent aria-hidden="true" className="space-y-5">
          <Skeleton className="h-4 w-2/5" />
          <Skeleton className="h-52 w-full rounded-lg sm:h-60" />
          <div className="flex justify-between gap-4">
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-none @4xl/dashboard:col-span-3 [--card-spacing:--spacing(5)]">
        <CardHeader className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold tracking-normal">Ostatnia aktywność</h2>
          <span className="text-xs text-muted-foreground">W przygotowaniu</span>
        </CardHeader>
        <CardContent aria-hidden="true" className="space-y-7 pt-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
