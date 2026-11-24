import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ListSkeletonProps {
  message?: string
  rows?: number
  rowClassName?: string
  className?: string
}

export function ListSkeleton({ message = 'Wczytywanie listy…', rows = 5, rowClassName, className }: ListSkeletonProps) {
  return (
    <div role="status" className={cn('space-y-4 p-5', className)}>
      <span className="sr-only">{message}</span>
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} aria-hidden="true" className={cn('h-10 w-full', rowClassName)} />
      ))}
    </div>
  )
}
