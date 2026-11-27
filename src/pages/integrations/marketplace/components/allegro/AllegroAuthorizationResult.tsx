import { useSearchParams } from 'react-router'
import { Button } from '@/components/ui/button'

export function AllegroAuthorizationResult() {
  const [params, setParams] = useSearchParams()
  const result = params.get('allegro')
  if (!result) return null

  const message = result === 'connected' ? 'Konto Allegro zostało połączone.'
    : result === 'cancelled' ? 'Anulowano autoryzację Allegro. Integracja nie została zmieniona.'
    : params.get('allegroMessage') ?? 'Nie udało się połączyć konta Allegro. Spróbuj ponownie.'

  return (
    <div role={result === 'error' ? 'alert' : 'status'} className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 text-sm ${result === 'error' ? 'border-destructive/30 text-destructive' : 'bg-muted/30'}`}>
      <p className="min-w-0 flex-1 wrap-anywhere">{message}</p>
      <Button type="button" variant="outline" onClick={() => {
        const next = new URLSearchParams(params)
        next.delete('allegro')
        next.delete('allegroMessage')
        setParams(next, { replace: true })
      }}>Zamknij</Button>
    </div>
  )
}
