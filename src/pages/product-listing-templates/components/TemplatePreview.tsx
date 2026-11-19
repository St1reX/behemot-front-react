import { useQuery } from '@tanstack/react-query'
import { productListingTemplateApiClient } from '@/api/product-listing-templates/ProductListingTemplateApiClient'
import { Button } from '@/components/ui/button'
import type { ListingTemplateContent } from '@/types/product-listing-templates/productListingTemplate.types'
import { escapeHtml } from '../listingTemplate.utils'

export function TemplatePreview({ content }: { content: ListingTemplateContent }) {
  const query = useQuery({
    queryKey: ['listing-template-preview', content],
    queryFn: ({ signal }) => productListingTemplateApiClient.preview(content, signal),
    retry: false,
    gcTime: 0,
    staleTime: 30_000,
  })
  const data = query.data
  const document = data ? `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>
    body{font:14px/1.6 system-ui,sans-serif;color:#1e293b;background:white;margin:0;padding:20px;overflow-wrap:anywhere}
    h1{font-size:22px;line-height:1.3}h2{font-size:20px}h3{font-size:17px}p{margin:0 0 12px}ul,ol{padding-left:24px}
    blockquote{border-left:3px solid #cbd5e1;margin:12px 0;padding-left:12px}section{border-top:1px solid #e2e8f0;margin-top:20px;padding-top:16px}
    .label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#64748b;margin-bottom:12px}
    </style></head><body><div class="label">Tytuł</div><h1>${escapeHtml(data.title) || 'Brak tytułu'}</h1><section><div class="label">Skrót</div>${data.summary}</section><section><div class="label">Opis</div>${data.description}</section></body></html>` : undefined

  return (
    <div className="space-y-3">
      <p role="status" className="text-xs text-muted-foreground">{query.isFetching ? 'Wczytywanie podglądu…' : query.error ? 'Nie udało się wygenerować podglądu.' : 'Podgląd na przykładowych danych.'}</p>
      {query.error ? (
        <div role="alert" className="space-y-3 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
          <p className="whitespace-pre-wrap">{query.error.message}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => { void query.refetch() }}>Ponów podgląd</Button>
        </div>
      ) : document ? (
        <iframe title="Podgląd ogłoszenia na przykładowych danych" sandbox="" referrerPolicy="no-referrer" srcDoc={document} className="h-[65dvh] min-h-64 w-full rounded-lg border bg-white" />
      ) : null}
    </div>
  )
}
