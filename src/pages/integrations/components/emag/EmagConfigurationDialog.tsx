import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { emagApiClient } from '@/api/integrations/emag/EmagApiClient'
import { FormActions } from '@/components/common/FormActions'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { emagConfigurationSchema } from '@/types/integrations/emag/emag.schema'
import type { EmagConfigurationInput } from '@/types/integrations/emag/emag.schema'
import { MarketplaceLogo } from '../MarketplaceLogo'
import romaniaFlag from '@/assets/images/flags/romania-flag.png'
import bulgariaFlag from '@/assets/images/flags/bulgaria-flag.png'
import hungaryFlag from '@/assets/images/flags/hungary-flag.png'

const markets = {
  RO: { name: 'Rumunia', flag: romaniaFlag },
  BG: { name: 'Bułgaria', flag: bulgariaFlag },
  HU: { name: 'Węgry', flag: hungaryFlag },
}

export function EmagConfigurationDialog({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmagConfigurationInput>({
    resolver: zodResolver(emagConfigurationSchema),
    defaultValues: { username: '', password: '' },
  })
  const mutation = useMutation({
    mutationFn: (input: EmagConfigurationInput) => emagApiClient.createConfiguration(input),
    gcTime: 0,
    retry: false,
    onSuccess: async (response, input) => {
      reset({ username: input.username, password: '' })
      await queryClient.invalidateQueries({ queryKey: ['integrations'] })
      const failed = response.results.some((result) => result.status === 'ERROR')
      toast.add({ type: failed ? 'error' : 'success', title: failed ? 'Sprawdź wyniki połączenia z rynkami eMAG.' : 'Zakończono konfigurację rynków eMAG.' })
    },
  })
  const results = mutation.data?.results
  const complete = Boolean(results?.length && results.every((result) => result.status !== 'ERROR'))

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <MarketplaceLogo channel="EMAG" className="h-16 w-40 object-contain" />
          <DialogTitle>Połącz konto eMAG</DialogTitle>
          <DialogDescription>Podaj e-mail i hasło raz. Sprawdzimy Rumunię, Bułgarię i Węgry i dodamy osobne konfiguracje dostępnych rynków.</DialogDescription>
        </DialogHeader>
        {results && (
          <ul aria-label="Wyniki połączenia z rynkami eMAG" aria-live="polite" className="space-y-2">
            {results.map((result) => (
              <li key={result.market} className="space-y-2 rounded-lg border p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2"><img src={markets[result.market].flag} alt="" className="h-4 w-6 rounded-xs object-cover ring-1 ring-foreground/10" />{markets[result.market].name}</span>
                  <span className={result.status === 'ERROR' ? 'text-destructive' : 'text-muted-foreground'}>{result.status === 'CONNECTED' ? 'Dodano' : result.status === 'EXISTING' ? 'Już skonfigurowano' : 'Nie połączono'}</span>
                </div>
                {result.error && <p className="text-xs text-destructive">{result.error}</p>}
              </li>
            ))}
          </ul>
        )}
        {complete ? <DialogFooter><Button type="button" onClick={onClose}>Zamknij</Button></DialogFooter> : <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => { if (!mutation.isPending) mutation.mutate(values) })}>
          <div className="grid gap-2">
            <label htmlFor="emag-username" className="text-sm font-medium">Adres e-mail</label>
            <Input id="emag-username" type="email" autoComplete="off" maxLength={255} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'emag-username-error' : undefined} {...register('username')} />
            {errors.username && <p id="emag-username-error" className="text-xs text-destructive">{errors.username.message}</p>}
          </div>
          <div className="grid gap-2">
            <label htmlFor="emag-password" className="text-sm font-medium">Hasło</label>
            <Input id="emag-password" type="password" autoComplete="new-password" maxLength={4096} disabled={mutation.isPending}
              aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'emag-password-error' : undefined} {...register('password')} />
            {errors.password && <p id="emag-password-error" className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">Użytkownik musi mieć uprawnienia API, a adres IP naszego serwera musi być dozwolony w eMAG. Hasło zapisujemy w zaszyfrowanej postaci.</p>
          <FormActions isPending={mutation.isPending} error={mutation.error?.message} onCancel={onClose} cancelLabel={results ? 'Zamknij' : 'Anuluj'} submitLabel={results ? 'Spróbuj ponownie' : 'Połącz konto'} pendingLabel="Sprawdzanie rynków eMAG…" />
        </form>}
      </DialogContent>
    </Dialog>
  )
}
