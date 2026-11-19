export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export function serializeTemplateHtml(html: string): string {
  const document = new DOMParser().parseFromString(html, 'text/html')
  document.querySelectorAll('span[data-template-variable]').forEach((node) => {
    node.replaceWith(document.createTextNode(node.textContent ?? ''))
  })
  return document.body.innerHTML
}

export function toEditorHtml(value: string, richText: boolean): string {
  const html = richText && /<\/?[a-z][^>]*>/i.test(value)
    ? value : `<p>${escapeHtml(value).replace(/\r?\n/g, richText ? '<br>' : ' ')}</p>`
  const document = new DOMParser().parseFromString(html, 'text/html')
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  const textNodes: globalThis.Node[] = []
  while (walker.nextNode()) textNodes.push(walker.currentNode)
  for (const node of textNodes) {
    const text = node.textContent ?? ''
    const matches = [...text.matchAll(/{{\s*([^{}]+?)\s*}}/g)]
    if (!matches.length) continue
    const fragment = document.createDocumentFragment()
    let offset = 0
    for (const match of matches) {
      fragment.append(text.slice(offset, match.index))
      const variable = document.createElement('span')
      variable.setAttribute('data-template-variable', match[1].trim())
      variable.textContent = match[0]
      fragment.append(variable)
      offset = match.index + match[0].length
    }
    fragment.append(text.slice(offset))
    node.parentNode?.replaceChild(fragment, node)
  }
  return document.body.innerHTML
}

export const LISTING_FIELD_LABELS = {
  titleTemplate: 'Tytuł ogłoszenia',
  summaryTemplate: 'Skrót opisu',
  descriptionTemplate: 'Opis ogłoszenia',
} as const
