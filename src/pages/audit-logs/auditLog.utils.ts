export function formatAuditDate(value: string) {
  return new Date(value).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'medium' })
}
