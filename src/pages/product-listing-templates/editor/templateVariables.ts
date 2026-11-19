import { Node, nodeInputRule, nodePasteRule } from '@tiptap/core'
import type { ListingPlaceholder } from '@/types/product-listing-templates/productListingTemplate.types'

// Zmienna jest niepodzielna w edytorze, ale zapis pozostaje zwykłym {{name}}.
export function templateVariables(placeholders: ListingPlaceholder[]) {
  const knownNames = new Set(placeholders.map((placeholder) => placeholder.name))
  return Node.create({
    name: 'templateVariable',
    group: 'inline',
    inline: true,
    atom: true,
    addAttributes() { return { name: { default: '' } } },
    parseHTML() {
      return [{ tag: 'span[data-template-variable]', getAttrs: (element) => ({ name: element.getAttribute('data-template-variable') }) }]
    },
    renderHTML({ node }) { return ['span', { 'data-template-variable': node.attrs.name }, '{{' + node.attrs.name + '}}'] },
    renderText({ node }) { return '{{' + node.attrs.name + '}}' },
    addNodeView() {
      return ({ node }) => {
        const dom = document.createElement('span')
        const known = knownNames.has(node.attrs.name)
        dom.className = known ? 'template-variable' : 'template-variable template-variable-unknown'
        dom.textContent = '{{' + node.attrs.name + '}}'
        dom.contentEditable = 'false'
        dom.title = known ? `Zmienna: ${node.attrs.name}` : 'Nieznana zmienna'
        return { dom }
      }
    },
    addInputRules() {
      return [nodeInputRule({
        find: /{{[^{}]+?}}$/,
        type: this.type,
        getAttributes: (match) => ({ name: match[0].slice(2, -2).trim() }),
      })]
    },
    addPasteRules() {
      return [nodePasteRule({
        find: /{{[^{}]+?}}/g,
        type: this.type,
        getAttributes: (match) => ({ name: match[0].slice(2, -2).trim() }),
      })]
    },
  })
}
