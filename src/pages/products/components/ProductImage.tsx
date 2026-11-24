import { Package } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductImage({ src, alt, className, lazy = false }: {
  src?: string
  alt: string
  className?: string
  lazy?: boolean
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const available = src && /^https?:\/\//i.test(src) && failedUrl !== src
  return <div className={cn('flex items-center justify-center overflow-hidden rounded-lg border bg-muted/20', className)}>
    {available ? <img src={src} alt={alt} loading={lazy ? 'lazy' : undefined} referrerPolicy="no-referrer"
      className="size-full object-contain" onError={() => setFailedUrl(src)} />
      : <div className="p-2 text-center text-muted-foreground">
        <Package aria-hidden="true" className="mx-auto size-5" />
        <span className="sr-only">
          {src ? 'Nie udało się wczytać zdjęcia.' : 'Brak zdjęcia.'}
        </span>
      </div>}
  </div>
}
