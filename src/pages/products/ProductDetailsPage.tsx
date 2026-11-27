import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { z } from 'zod'
import { productApiClient } from '@/api/products/ProductApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import { escapeHtml } from '@/pages/product-listing-templates/listingTemplate.utils'
import { ProductImage } from './components/ProductImage'
import { ProductIntegrations } from './components/ProductIntegrations'
import { PRODUCT_SIDE_LABELS } from '@/shared/constants/productSides'
import { formatFitment, formatPrice } from './product.utils'

export function ProductDetailsPage() {
  const { id } = useParams()
  const { requirePrivilege } = useAccess()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const validId = z.uuid().safeParse(id).success
  const query = useQuery({ queryKey: ['products', id], queryFn: ({ signal }) => productApiClient.get(id!, signal), enabled: validId, retry: false })
  if (!validId) return <p role="alert">Niepoprawny identyfikator produktu.</p>
  if (query.error) return <div className="space-y-3">
    <p role="alert" className="text-destructive">
      {query.error.message}
    </p>
    <Button onClick={() => { void query.refetch() }}>Ponów odczyt</Button>
    <Button nativeButton={false} variant="outline" render={<Link to="/products" />}>Wróć do produktów</Button>
  </div>
  if (!query.data) return <ListSkeleton message="Wczytywanie produktu…" />
  const product = query.data
  const image = selectedImage && product.imagesUrls.includes(selectedImage) ? selectedImage : product.imagesUrls[0]
  const listingDocument = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'"><style>body{font:14px/1.7 system-ui;color:#1e293b;background:white;padding:20px;margin:0;overflow-wrap:anywhere}h1{font-size:23px;line-height:1.3}section{margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px}</style></head><body><h1>${escapeHtml(product.title ?? '')}</h1>${product.summary ?? ''}<section>${product.description ?? ''}</section></body></html>`
  return <div className="space-y-6">
    <PageHeader title={product.customName ?? product.title ?? product.sku} description={`SKU: ${product.sku} · ${product.department?.name ?? 'Nie podano'} · ${product.producer?.name ?? 'Nie podano'}`} actions={<div className="flex gap-2">
      <Button nativeButton={false} variant="outline" render={<Link to="/products" />}>
        <ArrowLeft aria-hidden="true" />Produkty</Button>
      {requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.UPDATE}`) && <Button nativeButton={false} render={<Link to={`/products/${product.id}/edit`} />}>
        <Pencil aria-hidden="true" />Edytuj produkt</Button>}
    </div>} />
    {product.isLegacy && <p role="status" className="rounded-xl border p-4 text-sm">Produkt z importu. Zarządzanie ofertami nie zostało jeszcze przejęte.</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <ProductImage src={image} alt={product.customName ?? product.sku} className="aspect-[16/9] w-full rounded-xl" />
            {product.imagesUrls.length > 1 && <div className="flex flex-wrap gap-2">
              {product.imagesUrls.map((url, index) => <button key={`${url}-${index}`} type="button" aria-label={`Pokaż zdjęcie ${index + 1}`} aria-pressed={image === url} onClick={() => setSelectedImage(url)} className="size-16 overflow-hidden rounded-lg border bg-background p-1 outline-offset-2 aria-pressed:border-primary aria-pressed:ring-1 aria-pressed:ring-primary">
                <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-contain" />
              </button>)}
            </div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dopasowania do pojazdów <span className="ml-2 text-muted-foreground">
              {product.productFitments.length}
            </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {product.productFitments.length ? product.productFitments.map((fitment) => <div key={fitment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4">
              <div>
                <p className="font-medium">
                  {formatFitment(fitment)}
                </p>
                {!fitment.carGeneration && <p className="mt-1 text-xs text-muted-foreground">
                  {fitment.carModel ? 'Bez określonych lat produkcji' : 'Dopasowanie na poziomie marki'}
                </p>}
              </div>
              {fitment.isPrimary && <span className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                <Star aria-hidden="true" className="size-3" />Główne</span>}
            </div>) : <p className="text-sm text-muted-foreground">Nie przypisano pojazdów.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Integracje i oferty</CardTitle>
            <p className="text-sm text-muted-foreground">Produkt i jego dopasowania mogą mieć wiele ofert na tym samym koncie integracji.</p>
          </CardHeader>
          <CardContent>
            <ProductIntegrations listings={product.externalListings} contentVersion={product.contentVersion} isLegacy={product.isLegacy} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Treść ogłoszenia</CardTitle>
          </CardHeader>
          <CardContent>
            {product.listingContentError ? <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm">Szablon „{product.listingTemplate?.name ?? 'Nie podano'}” nie może wygenerować pełnej treści dla tych danych. {product.listingContentError}
            </p> : <iframe title="Podgląd treści ogłoszenia produktu" sandbox="" referrerPolicy="no-referrer" srcDoc={listingDocument} className="h-[32rem] w-full rounded-lg border bg-white" />}
          </CardContent>
        </Card>
        {product.descriptionImagesUrls.length > 0 && <Card>
          <CardHeader>
            <CardTitle>Zdjęcia do opisu</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {product.descriptionImagesUrls.map((url, index) => <img key={`${url}-${index}`} src={url} alt={`Zdjęcie do opisu ${index + 1}`} loading="lazy" referrerPolicy="no-referrer" className="aspect-square w-full rounded-lg border object-contain" />)}
          </CardContent>
        </Card>}
      </div>
      <aside className="space-y-5 xl:sticky xl:top-6">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cena produktu</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {formatPrice(product.price)}
            </p>
            <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm">
              <span>Stan magazynowy</span>
              <span className={product.quantity !== null && product.quantity > 0 ? 'font-semibold' : 'font-semibold text-destructive'}>
                {product.quantity === null ? 'Nie podano' : `${product.quantity} szt.`}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dane produktu</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              {[
                ['SKU', product.sku], ['EAN', product.ean], ['OEM', product.oem.join(', ') || null], ['Strona', product.side === null ? null : PRODUCT_SIDE_LABELS[product.side]], ['Producent', product.producer?.name ?? 'Nie podano'], ['Dział', product.department?.name ?? 'Nie podano'], ['Magazyn', product.warehouse?.name], ['Lokalizacja', product.warehouseLocation], ['Waga', product.weight === null ? null : `${product.weight} kg`], ['Długość × szerokość × wysokość', [product.length, product.width, product.height].map((value) => value === null ? 'Nie podano' : `${value} cm`).join(' × ')], ['Szablon', product.listingTemplate?.name ?? 'Nie podano'], ['Dodano', new Date(product.createdAt).toLocaleString('pl-PL')], ['Zaktualizowano', new Date(product.updatedAt).toLocaleString('pl-PL')],
              ].map(([label, value]) => <div key={label}>
                <dt className="text-xs text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-1 break-words">
                  {value ?? 'Nie podano'}
                </dd>
              </div>)}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notatka wewnętrzna</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap break-words text-muted-foreground">
              {product.internalNote || 'Brak notatki.'}
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
}
