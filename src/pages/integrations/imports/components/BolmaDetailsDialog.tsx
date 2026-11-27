import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Database, Download, LoaderCircle, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router'
import { importsApiClient } from '@/api/imports/ImportsApiClient'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ACTIONS } from '@/constants/actions'
import { ENTITIES } from '@/constants/entities'
import { useAccess } from '@/hooks/useAccess'
import { useAuthStore } from '@/stores/auth.store'
import type { BolmaIntegration } from '@/types/imports/imports.types'

export function BolmaDetailsDialog({ integration, onClose }: {
  integration: BolmaIntegration
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { requirePrivilege } = useAccess()
  const userId = useAuthStore((state) => state.user?.id)
  const storageKey = `bolma-import-report:${userId}`
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [importId, setImportId] = useState<string | null>(() => {
    try { return localStorage.getItem(storageKey) } catch { return null }
  })
  const canImport = requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.UPDATE}`)
    && requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.CREATE}`)
    && requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.UPDATE}`)
  const sync = useMutation({
    mutationFn: importsApiClient.importBolmaProducts,
    retry: false,
    onSettled: () => {
      setConfirmOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
  const download = useMutation({ mutationFn: importsApiClient.downloadBolmaReport, retry: false })
  const blocker = useBlocker(sync.isPending)

  useEffect(() => {
    if (blocker.state === 'blocked') blocker.reset()
  }, [blocker])

  useEffect(() => {
    if (!sync.isPending) return
    const preventUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', preventUnload)
    return () => window.removeEventListener('beforeunload', preventUnload)
  }, [sync.isPending])

  const details = [
    ['Silnik bazy', integration.engine],
    ['Konfiguracja', integration.isConfigured ? 'Skonfigurowana' : 'Brak konfiguracji'],
    ['Źródło konfiguracji', 'Środowisko serwera (.env)'],
    ['Szyfrowanie połączenia SSL', integration.sslEnabled ? 'Włączone' : 'Wyłączone'],
  ]

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !sync.isPending) onClose() }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto font-sans sm:max-w-2xl" showCloseButton={!sync.isPending}>
        <DialogHeader className="pr-8">
          <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database aria-hidden="true" className="size-5" />
          </div>
          <DialogTitle>{integration.name}</DialogTitle>
          <DialogDescription>Źródło katalogu produktów i synchronizacja danych z Bolmy.</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-3 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label} className="space-y-1 rounded-lg border p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="wrap-anywhere text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {sync.isPending && <p role="status" className="flex items-start gap-2 rounded-lg bg-muted p-3 text-sm">
          <LoaderCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 animate-spin motion-reduce:animate-none" />
          Trwa synchronizacja produktów. Poczekaj i nie zamykaj strony. Po zakończeniu raport XLSX pobierze się automatycznie.
        </p>}
        {sync.isSuccess && <p role="status" className="rounded-lg bg-muted p-3 text-sm">Przebieg zakończony. Rozpoczęto pobieranie raportu. Sprawdź arkusze INFO, WARNING i ERROR — zakończenie żądania nie oznacza, że wszystkie rekordy zostały zapisane.</p>}
        {sync.error && <p role="alert" className="text-sm text-destructive">{sync.error.message} Część produktów mogła zostać już zapisana. Spróbuj pobrać raport tego przebiegu przed ponownym uruchomieniem synchronizacji.</p>}
        {download.error && <p role="alert" className="text-sm text-destructive">{download.error.message}</p>}
        {!canImport && <p className="text-xs text-muted-foreground">Synchronizacja wymaga uprawnień do aktualizacji integracji oraz tworzenia i aktualizacji produktów.</p>}
        <DialogFooter className="flex-wrap">
          <Button type="button" variant="outline" disabled={sync.isPending} onClick={onClose}>Zamknij</Button>
          {importId && <Button type="button" variant="outline" disabled={sync.isPending || download.isPending} onClick={() => download.mutate(importId)}>
            <Download aria-hidden="true" />{download.isPending ? 'Pobieranie…' : 'Pobierz ostatni raport'}
          </Button>}
          {canImport && <Button type="button" disabled={!integration.isConfigured || sync.isPending || download.isPending} onClick={() => setConfirmOpen(true)}>
            <RefreshCw aria-hidden="true" />Przeprowadź synchronizację produktów
          </Button>}
        </DialogFooter>
      </DialogContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Przeprowadzić synchronizację produktów z Bolmy?"
        description={<span className="block max-h-[55dvh] space-y-3 overflow-y-auto pr-2">
          <span className="block">Import odczyta aktywne produkty Bolmy. Dla powielonego SKU wybierze rekord o najwyższym ID; starsze rekordy i produkty bez SKU zostaną pominięte.</span>
          <span className="block">Nowe SKU utworzą produkty legacy: nazwa, długość w cm, waga w kg, lokalizacja magazynowa, dział i dopasowania pojazdów według istniejących słowników. Braki i niejednoznaczności znajdziesz w raporcie.</span>
          <span className="block">Istniejącym produktom legacy import uzupełni wyłącznie pustą nazwę i brakującą lub zerową długość albo wagę. Nie nadpisze pozostałych danych. Produkty zarządzane przez Behemotha, usunięte i niejednoznaczne SKU pozostawi bez zmian.</span>
          <span className="block">Import nie usuwa produktów, nie zmienia danych Bolmy, nie importuje cen, stanów, zdjęć ani ofert marketplace. Każdy zapis zostanie odnotowany na Twoim koncie w audycie.</span>
          <span className="block font-medium">Każdy produkt zapisuje się osobno. Błąd rekordu nie zatrzymuje pozostałych; przerwanie nie cofa wcześniejszych zapisów. Nie edytuj równocześnie produktów ani słowników. Poczekaj do końca — raport XLSX z arkuszami INFO, WARNING i ERROR pobierze się automatycznie.</span>
        </span>}
        confirmLabel="Potwierdzam — synchronizuj produkty"
        pendingLabel="Synchronizacja i przygotowywanie raportu…"
        isPending={sync.isPending}
        onConfirm={() => {
          const nextImportId = crypto.randomUUID()
          setImportId(nextImportId)
          try { localStorage.setItem(storageKey, nextImportId) } catch { /* The report remains available in this modal. */ }
          download.reset()
          sync.mutate(nextImportId)
        }}
      />
    </Dialog>
  )
}
