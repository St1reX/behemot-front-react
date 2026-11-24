import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface FormActionsProps {
  isPending?: boolean
  error?: string
  onCancel?: () => void
  cancelLabel?: ReactNode
  submitLabel?: ReactNode
  pendingLabel?: ReactNode
  showSubmit?: boolean
  submitDisabled?: boolean
  submitProps?: Omit<ComponentProps<typeof Button>, 'type' | 'disabled' | 'children'>
  layout?: 'dialog' | 'inline'
  className?: string
  children?: ReactNode
}

export function FormActions({
  isPending = false, error, onCancel, cancelLabel = 'Anuluj',
  submitLabel = 'Zapisz', pendingLabel = 'Zapisywanie…', showSubmit = true,
  submitDisabled = false, submitProps, layout = 'dialog', className, children,
}: FormActionsProps) {
  const buttons = (
    <>
      {onCancel && (
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          {cancelLabel}
        </Button>
      )}
      {children}
      {showSubmit && (
        <Button {...submitProps} type="submit" disabled={isPending || submitDisabled}>
          {isPending ? pendingLabel : submitLabel}
        </Button>
      )}
    </>
  )

  return (
    <>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {layout === 'dialog' ? (
        <DialogFooter className={className}>{buttons}</DialogFooter>
      ) : (
        <div className={cn('flex flex-wrap gap-2', className)}>{buttons}</div>
      )}
    </>
  )
}
