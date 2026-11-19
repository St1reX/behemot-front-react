import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { producerApiClient } from '@/api/producers/ProducerApiClient'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import { producerSchema } from '@/types/producers/producer.schema'
import type { Producer } from '@/types/producers/producer.types'
import type { ProducerInput } from '@/types/producers/producer.schema'

export function ProducerEditorDialog({ producer, onClose }: {
  producer: Producer | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<ProducerInput>({
    resolver: zodResolver(producerSchema),
    defaultValues: { name: producer?.name ?? '' },
  })
  const mutation = useMutation({
    mutationFn: (values: ProducerInput) => producer
      ? producerApiClient.update(producer.id, values)
      : producerApiClient.create(values),
    retry: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['producers'] })
      toast.add({ type: 'success', title: 'Zmiany zostały zapisane.' })
      onClose()
    },
  })

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.isPending) onClose() }}>
      <DialogContent className="font-sans sm:max-w-md" showCloseButton={!mutation.isPending}>
        <DialogHeader>
          <DialogTitle>{producer ? 'Edytuj producenta' : 'Dodaj producenta'}</DialogTitle>
          <DialogDescription>Podaj nazwę. Maksymalnie 100 znaków.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <div className="grid gap-2">
            <label htmlFor="producer-name" className="text-sm font-medium">Nazwa</label>
            <Input
              id="producer-name"
              maxLength={100}
              disabled={mutation.isPending}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'producer-name-error' : undefined}
              {...register('name')}
            />
            {errors.name && <p id="producer-name-error" className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          {mutation.error && <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" disabled={mutation.isPending} onClick={onClose}>Anuluj</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Zapisywanie…' : 'Zapisz'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
