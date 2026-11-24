import { RefreshCw, Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { FormActions } from './FormActions'

interface ListToolbarProps {
  search?: {
    value: string
    onChange: (value: string) => void
    label: string
    placeholder?: string
    maxLength?: number
    onSubmit?: () => void
  }
  summary?: ReactNode
  isFetching: boolean
  onRefresh: () => void
  children?: ReactNode
  className?: string
}

export function ListToolbar({ search, summary, isFetching, onRefresh, children, className }: ListToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-3 border-b p-4', className)}>
      <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
        {search && (
          <form className="flex w-full items-center gap-2 sm:w-auto" onSubmit={(event) => {
            event.preventDefault()
            search.onSubmit?.()
          }}>
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label={search.label}
                placeholder={search.placeholder ?? search.label}
                maxLength={search.maxLength}
                className="pl-9"
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
              />
            </div>
            {search.onSubmit && <FormActions layout="inline" submitLabel="Szukaj" submitProps={{ variant: 'outline', size: 'sm' }} />}
          </form>
        )}
        {children}
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {summary}
        <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={onRefresh}>
          <RefreshCw aria-hidden="true" className={isFetching ? 'animate-spin motion-reduce:animate-none' : undefined} />
          Odśwież
        </Button>
      </div>
    </div>
  )
}
