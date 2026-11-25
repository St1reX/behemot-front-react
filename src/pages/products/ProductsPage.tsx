import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Pencil, Plus, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { productApiClient } from '@/api/products/ProductApiClient'
import { ListSkeleton } from '@/components/common/ListSkeleton'
import { ListToolbar } from '@/components/common/ListToolbar'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { IntegrationChannel } from '@/types/products/product.types'
import { ProductImage } from './components/ProductImage'
import { ProductIntegrations } from './components/ProductIntegrations'
import { CHANNEL_LABELS } from './product.constants'
import { formatFitment, formatPrice } from './product.utils'

const PAGE_SIZE = 25
export function ProductsPage() {
  const { requirePrivilege } = useAccess()
  const [search, setSearch] = useState('')
  const [channel, setChannel] = useState('')
  const [stock, setStock] = useState('')
  const [page, setPage] = useState(1)
  const query = useQuery({ queryKey: ['products'], queryFn: ({ signal }) => productApiClient.list(signal), retry: false })
  const products = query.data ?? []
  const phrase = search.trim().toLocaleLowerCase('pl-PL')
  const filtered = products.filter((product) => {
    const matchesSearch = [product.sku, product.ean, product.customName, product.title, product.producer?.name, ...product.oem, ...product.productFitments.map(formatFitment)]
      .some((value) => value?.toLocaleLowerCase('pl-PL').includes(phrase))
    return matchesSearch && (!channel || product.externalListings.some((listing) => listing.channel === channel))
      && (!stock || (stock === 'available' ? product.quantity !== null && product.quantity > 0 : stock === 'unknown' ? product.quantity === null : product.quantity === 0))
  })
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const canUpdate = requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.UPDATE}`)
  return <div className="space-y-6">
    <PageHeader title="Produkty" description="Jeden katalog produktów. Wszystkie dopasowania i kanały sprzedaży w jednym miejscu."
      actions={requirePrivilege(`${ENTITIES.PRODUCT}:${ACTIONS.CREATE}`) && <Button nativeButton={false} render={<Link to="/products/new" />}>
        <Plus aria-hidden="true" />Dodaj produkt</Button>} />
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        ['Produkty w katalogu', products.length, 'Unikalne numery SKU'],
        ['Dostępne na magazynie', products.filter((product) => product.quantity !== null && product.quantity > 0).length, 'Produkty ze stanem większym od zera'],
        ['Z ofertami zewnętrznymi', products.filter((product) => product.externalListings.some((listing) => listing.externalId)).length, 'Przynajmniej jedna oferta z identyfikatorem'],
      ].map(([label, count, hint]) => <Card key={label} className="gap-0 py-0">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground">
            {label}
          </p>
          <p className="my-2 text-3xl font-semibold tabular-nums">
            {query.isPending || query.error ? '—' : count}
          </p>
          <p className="text-xs text-muted-foreground">
            {hint}
          </p>
        </CardContent>
      </Card>)}
    </div>
    <Card className="gap-0 overflow-hidden py-0">
      <CardContent className="p-0">
        <ListToolbar search={{ value: search, onChange: (value) => { setSearch(value); setPage(1) }, label: 'Szukaj produktów', placeholder: 'SKU, nazwa, EAN, OEM, pojazd…' }} isFetching={query.isFetching} onRefresh={() => { void query.refetch() }} summary={!query.isPending && !query.error && `${filtered.length} z ${products.length} produktów`}>
          <NativeSelect aria-label="Kanał sprzedaży" value={channel} onChange={(event) => { setChannel(event.target.value); setPage(1) }}>
            <NativeSelectOption value="">Wszystkie integracje</NativeSelectOption>
            {(Object.keys(CHANNEL_LABELS) as IntegrationChannel[]).map((key) => <NativeSelectOption key={key} value={key}>
              {CHANNEL_LABELS[key]}
            </NativeSelectOption>)}
          </NativeSelect>
          <NativeSelect aria-label="Stan magazynowy" value={stock} onChange={(event) => { setStock(event.target.value); setPage(1) }}>
            <NativeSelectOption value="">Każdy stan</NativeSelectOption>
            <NativeSelectOption value="available">Dostępne</NativeSelectOption>
            <NativeSelectOption value="empty">Brak na stanie</NativeSelectOption>
            <NativeSelectOption value="unknown">Nie podano</NativeSelectOption>
          </NativeSelect>
        </ListToolbar>
        {query.error ? <p role="alert" className="p-6 text-sm text-destructive">
          {query.error.message} Ponów odczyt przyciskiem „Odśwież”.</p> : query.isPending ? <ListSkeleton message="Wczytywanie produktów…" /> : filtered.length === 0 ? <div role="status" className="flex flex-col items-center gap-3 p-12 text-center">
            <SearchX aria-hidden="true" className="size-9 text-muted-foreground" />
            <p className="font-medium">
              {products.length ? 'Brak pasujących produktów' : 'Twój katalog czeka na pierwszy produkt'}
            </p>
            <p className="text-sm text-muted-foreground">
              {products.length ? 'Zmień frazę lub wybrane filtry.' : 'Dodaj produkt, określ dopasowania i uzupełnij dane magazynowe.'}
            </p>
          </div> : <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5">Produkt</TableHead>
                  <TableHead>Dopasowanie</TableHead>
                  <TableHead className="text-right">Cena / stan</TableHead>
                  <TableHead>Integracje</TableHead>
                  <TableHead className="pr-5 text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE).map((product) => <TableRow key={product.id}>
                  <TableCell className="min-w-60 max-w-96 pl-5">
                    <div className="flex items-center gap-3">
                      <ProductImage src={product.imagesUrls[0]} alt="" lazy className="size-14 shrink-0" />
                      <div className="min-w-0">
                        <Link to={`/products/${product.id}`} className="line-clamp-2 font-medium whitespace-normal break-words hover:underline">
                          {product.customName ?? product.title ?? product.sku}
                        </Link>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {product.producer?.name ?? 'Nie podano'} · {product.department?.name ?? 'Nie podano'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="min-w-44 max-w-72 whitespace-normal">
                    <p className="text-sm">
                      {product.primaryFitment ? formatFitment(product.primaryFitment) : 'Nie przypisano pojazdu'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.productFitments.length} dopasowań</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <p className="font-medium tabular-nums">
                      {formatPrice(product.price)}
                    </p>
                    <p className={product.quantity ? 'mt-1 text-xs text-muted-foreground' : 'mt-1 text-xs text-destructive'}>
                      {product.quantity === null ? 'Nie podano' : `${product.quantity} szt.`}</p>
                  </TableCell>
                  <TableCell className="min-w-52">
                    <ProductIntegrations listings={product.externalListings} contentVersion={product.contentVersion} isLegacy={product.isLegacy} compact />
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex justify-end gap-1">
                      <Button nativeButton={false} variant="ghost" size="icon" render={<Link to={`/products/${product.id}`} />} aria-label={`Podgląd ${product.sku}`} title="Podgląd">
                        <ArrowRight aria-hidden="true" />
                      </Button>
                      {canUpdate && <Button nativeButton={false} variant="ghost" size="icon" render={<Link to={`/products/${product.id}/edit`} />} aria-label={`Edytuj ${product.sku}`} title="Edytuj">
                        <Pencil aria-hidden="true" />
                      </Button>}
                    </div>
                  </TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between gap-3 border-t p-4 text-xs text-muted-foreground">
              <span>Strona {currentPage} z {pageCount}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Poprzednia</Button>
                <Button variant="outline" size="sm" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Następna</Button>
              </div>
            </div>
          </>}
      </CardContent>
    </Card>
  </div>
}
