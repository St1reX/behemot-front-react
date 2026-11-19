import { useQuery } from '@tanstack/react-query'
import { Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import { productListingTemplateApiClient } from '@/api/product-listing-templates/ProductListingTemplateApiClient'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAccess } from '@/hooks/useAccess'
import { ACTIONS } from '@/shared/constants/actions'
import { ENTITIES } from '@/shared/constants/entities'
import type { ProductListingTemplate } from '@/types/product-listing-templates/productListingTemplate.types'
import { ProductListingTemplateDeleteDialog } from './components/ProductListingTemplateDeleteDialog'

export function ProductListingTemplatesPage() {
  const { requirePrivilege } = useAccess()
  const [search, setSearch] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [deleting, setDeleting] = useState<ProductListingTemplate | null>(null)
  const canCreate = requirePrivilege(`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.CREATE}`)
  const canUpdate = requirePrivilege(`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.UPDATE}`)
  const canDelete = requirePrivilege(`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.DELETE}`)
  const query = useQuery({
    queryKey: ['product-listing-templates'],
    queryFn: ({ signal }) => productListingTemplateApiClient.list(signal),
    enabled: requirePrivilege(`${ENTITIES.PRODUCT_LISTING_TEMPLATE}:${ACTIONS.READ}`),
    retry: false,
  })
  const templates = query.data ?? []
  const departments = [...new Map(templates.map((template) => [template.department.id, template.department])).values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'))
  const phrase = search.trim().toLocaleLowerCase('pl-PL')
  const selectedDepartmentId = departments.some((department) => department.id === departmentId) ? departmentId : ''
  const filtered = templates.filter((template) => (!selectedDepartmentId || template.department.id === selectedDepartmentId)
    && `${template.name} ${template.titleTemplate} ${template.department.name}`.toLocaleLowerCase('pl-PL').includes(phrase))

  return (
    <div className="space-y-6">
      <PageHeader title="Szablony ogłoszeń" description="Tytuły, skróty i opisy uzupełniane automatycznie danymi produktów."
        actions={canCreate && <Button render={<Link to="/listing-templates/new" />} nativeButton={false}><Plus aria-hidden="true" />Dodaj szablon</Button>} />
      <Card className="gap-0 py-0">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="flex w-full flex-wrap gap-3 sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input aria-label="Szukaj szablonu" placeholder="Szukaj szablonu…" className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <select aria-label="Filtruj szablony według działu" value={selectedDepartmentId} onChange={(event) => setDepartmentId(event.target.value)}
                className="h-8 max-w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                <option value="">Wszystkie działy</option>
                {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {!query.isPending && !query.error && <span>Wyniki: {filtered.length} / {templates.length}</span>}
              <Button type="button" variant="outline" size="sm" disabled={query.isFetching} onClick={() => { void query.refetch() }}>
                <RefreshCw aria-hidden="true" className={query.isFetching ? 'animate-spin motion-reduce:animate-none' : undefined} />Odśwież
              </Button>
            </div>
          </div>
          {query.error ? <p role="alert" className="p-6 text-sm text-destructive">{query.error.message} Użyj przycisku „Odśwież”, aby ponowić odczyt.</p>
            : query.isPending ? <div role="status" className="space-y-4 p-5"><span className="sr-only">Wczytywanie szablonów…</span>
              {Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}</div>
            : filtered.length === 0 ? <p role="status" className="p-10 text-center text-sm text-muted-foreground">{templates.length === 0 ? 'Nie dodano jeszcze żadnych szablonów.' : 'Brak wyników dla wybranych filtrów.'}</p>
            : <Table>
              <TableHeader><TableRow>
                <TableHead className="pl-5">Szablon</TableHead><TableHead>Dział</TableHead>
                <TableHead className="hidden lg:table-cell">Zmieniono</TableHead><TableHead className="pr-5 text-right">Akcje</TableHead>
              </TableRow></TableHeader>
              <TableBody>{filtered.map((template) => <TableRow key={template.id}>
                <TableCell className="max-w-xs pl-5">
                  <Link to={`/listing-templates/${template.id}`} className="font-medium text-primary underline-offset-4 hover:underline">{template.name}</Link>
                </TableCell>
                <TableCell>{template.department.name}</TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">{new Date(template.updatedAt).toLocaleDateString('pl-PL')}</TableCell>
                <TableCell className="pr-5"><div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" render={<Link to={`/listing-templates/${template.id}`} />} nativeButton={false}
                    title={canUpdate ? 'Edytuj' : 'Podgląd'} aria-label={`${canUpdate ? 'Edytuj' : 'Pokaż'} ${template.name}`}>
                    {canUpdate ? <Pencil aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  </Button>
                  {canDelete && <Button type="button" variant="ghost" size="icon" title="Usuń" aria-label={`Usuń ${template.name}`}
                    className="text-destructive hover:text-destructive" onClick={() => setDeleting(template)}><Trash2 aria-hidden="true" /></Button>}
                </div></TableCell>
              </TableRow>)}</TableBody>
            </Table>}
        </CardContent>
      </Card>
      {deleting && <ProductListingTemplateDeleteDialog template={deleting} onClose={() => setDeleting(null)} />}
    </div>
  )
}
