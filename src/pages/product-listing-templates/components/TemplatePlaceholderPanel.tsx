import { Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ListingPlaceholder } from '@/types/product-listing-templates/productListingTemplate.types'

export function TemplatePlaceholderPanel({ placeholders, activeLabel, disabled, onInsert }: {
  placeholders: ListingPlaceholder[]
  activeLabel: string | null
  disabled: boolean
  onInsert: (name: string) => void
}) {
  const [search, setSearch] = useState('')
  const phrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = placeholders.filter((placeholder) => `${placeholder.name} ${placeholder.label}`.toLocaleLowerCase('pl-PL').includes(phrase))

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">Dostępne zmienne</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {disabled ? 'Zmienne zastępowane danymi produktu.' : activeLabel
            ? `Kliknij zmienną, aby wstawić ją w polu „${activeLabel}”.`
            : 'Kliknij miejsce w edytorze, a następnie wybierz zmienną.'}
        </p>
      </div>
      <div className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Znajdź zmienną…" aria-label="Szukaj zmiennej" className="pl-9" />
      </div>
      <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
        Zmienne oznaczone „opcjonalna” wymagają uzupełnienia danych produktu. Ich brak zatrzyma generowanie ogłoszenia. Wielkość liter ma znaczenie.
      </p>
      <div className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
        {filtered.map((placeholder) => (
          <div key={placeholder.name} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-medium">{placeholder.label}</span>
              {placeholder.optional && <span className="text-[10px] text-muted-foreground">opcjonalna</span>}
            </div>
            <Button type="button" variant="secondary" size="sm" className="my-2 font-mono text-xs"
              disabled={disabled || !activeLabel} onMouseDown={(event) => event.preventDefault()} onClick={() => onInsert(placeholder.name)}
              aria-label={`Wstaw zmienną ${placeholder.label}`}>
              {'{{' + placeholder.name + '}}'}
            </Button>
            <p className="text-xs text-muted-foreground">{placeholder.description}</p>
            <p className="mt-1 text-xs wrap-anywhere">Przykład: {placeholder.example || '(pusta wartość)'}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Brak pasujących zmiennych.</p>}
      </div>
    </div>
  )
}
