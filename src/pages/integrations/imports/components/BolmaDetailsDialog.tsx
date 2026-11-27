import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, CircleCheck, Database, Download, FileSpreadsheet, LoaderCircle, RefreshCw, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router'
import { importsApiClient } from '@/api/imports/ImportsApiClient'
import { saveDownloadedFile } from '@/api/files/download'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ACTIONS } from '@/constants/actions'
import { ENTITIES } from '@/constants/entities'
import { useAccess } from '@/hooks/useAccess'
import type { BolmaIntegration } from '@/types/imports/imports.types'

export function BolmaDetailsDialog({ integration, onClose }: {
  integration: BolmaIntegration
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { requirePrivilege } = useAccess()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const canImport = requirePrivilege(`${ENTITIES.INTEGRATION}:${ACTIONS.UPDATE}`)
    && requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.CREATE}`)
    && requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.UPDATE}`)
  const sync = useMutation({
    mutationFn: importsApiClient.importBolmaProducts,
    retry: false,
    onSuccess: saveDownloadedFile,
    onSettled: () => {
      setConfirmOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
    },
  })
  const download = useMutation({
    mutationFn: importsApiClient.downloadLatestBolmaReport,
    retry: false,
    onSuccess: saveDownloadedFile,
  })
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

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !sync.isPending) onClose() }}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 font-sans sm:max-w-xl"
        showCloseButton={!sync.isPending}
      >
        <DialogHeader className="shrink-0 border-b p-5 pr-10 sm:p-6 sm:pr-12">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Database aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle className="text-lg">{integration.name}</DialogTitle>
              <DialogDescription>Import katalogu produktów do Behemotha.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 space-y-6 overflow-y-auto p-5 sm:p-6">
          <section aria-label="Konfiguracja źródła" className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-medium">Źródło danych</h3>
              <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${integration.isConfigured ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
                <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
                {integration.isConfigured ? 'Konfiguracja dostępna' : 'Brak konfiguracji'}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">Baza danych</dt>
                <dd className="text-sm font-medium">{integration.engine}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs text-muted-foreground">Szyfrowanie SSL</dt>
                <dd className="text-sm font-medium">{integration.sslEnabled ? 'Włączone' : 'Wyłączone'}</dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="bolma-sync-heading" className="space-y-2">
            <h3 id="bolma-sync-heading" className="text-sm font-medium">Synchronizacja produktów</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Dodaj nowe produkty i uzupełnij brakujące dane w katalogu. Przed rozpoczęciem zobaczysz dokładny zakres zmian.
            </p>
          </section>

          <section aria-labelledby="bolma-report-heading" className="space-y-2.5">
            <h3 id="bolma-report-heading" className="text-sm font-medium">Raport z importu</h3>
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-start gap-3 whitespace-normal rounded-xl p-4 text-left"
              disabled={sync.isPending || download.isPending}
              onClick={() => download.mutate()}
            >
              <FileSpreadsheet aria-hidden="true" className="size-5 text-muted-foreground" />
              <span className="min-w-0 flex-1 space-y-1">
                <span className="block text-sm font-medium">{download.isPending ? 'Pobieranie raportu…' : 'Pobierz najnowszy raport importu'}</span>
                <span className="block text-xs font-normal text-muted-foreground">XLSX · INFO, WARNING i ERROR</span>
              </span>
              {download.isPending
                ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                : <Download aria-hidden="true" className="size-4 text-muted-foreground" />}
            </Button>
          </section>

          {sync.isSuccess && <div role="status" className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Raport jest gotowy</p>
              <p className="text-xs leading-relaxed text-muted-foreground">Rozpoczęto pobieranie pliku. Sprawdź wyniki we wszystkich trzech arkuszach — raport może zawierać błędy lub pominięte produkty.</p>
            </div>
          </div>}
          {sync.error && <div role="alert" className="space-y-1 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
            <p className="font-medium text-destructive">{sync.error.message}</p>
            <p className="text-xs leading-relaxed text-muted-foreground">Część produktów mogła zostać zapisana. Sprawdź najnowszy raport przed ponownym uruchomieniem importu.</p>
          </div>}
          {download.error && <p role="alert" className="rounded-lg bg-destructive/5 p-3 text-sm text-destructive">{download.error.message}</p>}
          {!canImport && <p className="text-xs leading-relaxed text-muted-foreground">Synchronizacja wymaga uprawnień do aktualizacji integracji oraz tworzenia i aktualizacji produktów.</p>}
        </div>

        <DialogFooter className="mx-0 mb-0 shrink-0 flex-row items-center justify-end gap-2 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" disabled={sync.isPending} onClick={onClose}>Zamknij</Button>
          {canImport && <Button
            type="button"
            disabled={!integration.isConfigured || sync.isPending || download.isPending}
            onClick={() => setConfirmOpen(true)}
          >
            <RefreshCw aria-hidden="true" />Synchronizuj
          </Button>}
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!sync.isPending) setConfirmOpen(open) }}>
        <AlertDialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 font-sans data-[size=default]:max-w-[calc(100%-2rem)] data-[size=default]:sm:max-w-2xl">
          <AlertDialogHeader className="shrink-0 place-items-start gap-2 border-b p-5 text-left sm:p-6">
            <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Database aria-hidden="true" className="size-3.5" />BOLMA<ArrowRight aria-hidden="true" className="size-3" />BEHEMOT
            </span>
            <AlertDialogTitle className="text-lg">{sync.isPending ? 'Synchronizacja w toku' : 'Potwierdź import produktów'}</AlertDialogTitle>
            <AlertDialogDescription className="text-left text-pretty">
              {sync.isPending ? 'Poczekaj na zakończenie importu i przygotowanie raportu.' : 'Sprawdź, jakie zmiany zostaną wprowadzone w katalogu.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
            {sync.isPending ? (
              <div role="status" className="flex flex-col items-center gap-4 py-6 text-center sm:py-10">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <LoaderCircle aria-hidden="true" className="size-7 animate-spin motion-reduce:animate-none" />
                </div>
                <div className="max-w-sm space-y-2">
                  <p className="font-medium">Synchronizujemy katalog produktów</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">Nie zamykaj ani nie odświeżaj strony. Produkty są przetwarzane, a zmiany zapisywane na bieżąco.</p>
                </div>
                <p className="flex items-center gap-2 text-xs text-muted-foreground"><FileSpreadsheet aria-hidden="true" className="size-4" />Raport XLSX pobierze się automatycznie.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">1</span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-medium">Dodanie nowych produktów</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">Aktywne produkty Bolmy z nowym SKU zostaną utworzone jako legacy. Import obejmuje nazwę, długość w cm, wagę w kg, lokalizację magazynową, dział i dopasowania do istniejącego katalogu pojazdów.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">2</span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-medium">Uzupełnienie brakujących danych</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">Istniejącym produktom legacy uzupełnimy tylko pustą nazwę oraz brakującą lub zerową długość i wagę. Produkty zarządzane przez Behemotha, usunięte oraz niejednoznaczne SKU pozostaną bez zmian.</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span aria-hidden="true" className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">3</span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-medium">Kontrola danych i raport</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">Przy powielonym SKU wybierzemy rekord Bolmy o najwyższym ID. Starsze rekordy i brak SKU pominiemy. Wyniki, ostrzeżenia i błędy znajdziesz w trzech arkuszach raportu XLSX.</p>
                    </div>
                  </li>
                </ol>

                <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
                  <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs leading-relaxed text-muted-foreground">Import nie usuwa produktów, nie zmienia danych Bolmy i nie pobiera cen, stanów, zdjęć ani ofert marketplace. Każdy zapis zostanie odnotowany w audycie na Twoim koncie.</p>
                </div>
                <div className="flex gap-3 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                  <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Zmiany są zapisywane na bieżąco</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">Błąd pojedynczego rekordu nie zatrzymuje pozostałych. Przerwanie importu nie cofa wcześniejszych zapisów. Podczas synchronizacji nie edytuj produktów ani słowników.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter className="mx-0 mb-0 shrink-0 flex-row items-center justify-end gap-2 px-5 py-4 sm:px-6">
            <AlertDialogCancel disabled={sync.isPending}>Wróć</AlertDialogCancel>
            <AlertDialogAction
              className="min-w-36"
              disabled={sync.isPending}
              onClick={() => { download.reset(); sync.mutate() }}
            >
              {sync.isPending ? <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" /> : <RefreshCw aria-hidden="true" />}
              {sync.isPending ? 'Importowanie…' : 'Rozpocznij import'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
