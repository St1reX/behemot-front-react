import { Node, type Editor } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Undo2, Redo2, Underline } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ListingPlaceholder } from '@/types/product-listing-templates/productListingTemplate.types'
import { templateVariables } from '../editor/templateVariables'
import { serializeTemplateHtml, toEditorHtml } from '../listingTemplate.utils'

const singleLineDocument = Node.create({ name: 'doc', topNode: true, content: 'paragraph' })

interface TemplateFieldEditorProps {
  id: string
  label: string
  initialValue: string
  placeholders: ListingPlaceholder[]
  richText?: boolean
  disabled?: boolean
  active?: boolean
  error?: string
  onChange: (value: string) => void
  onBlur: () => void
  onFocus: (editor: Editor) => void
}

export function TemplateFieldEditor({
  id, label, initialValue, placeholders, richText = false, disabled = false,
  active, error, onChange, onBlur, onFocus,
}: TemplateFieldEditorProps) {
  const [initialContent] = useState(() => toEditorHtml(initialValue, richText))
  const extensions = useMemo(() => [
    StarterKit.configure({
      document: richText ? undefined : false,
      heading: richText ? { levels: [2, 3] } : false,
      bold: richText ? undefined : false,
      italic: richText ? undefined : false,
      underline: richText ? undefined : false,
      strike: richText ? undefined : false,
      bulletList: richText ? undefined : false,
      orderedList: richText ? undefined : false,
      listItem: richText ? undefined : false,
      listKeymap: richText ? undefined : false,
      hardBreak: richText ? undefined : false,
      blockquote: richText ? undefined : false,
      trailingNode: false,
      code: false,
      codeBlock: false,
      horizontalRule: false,
      link: false,
    }),
    ...(!richText ? [singleLineDocument] : []),
    templateVariables(placeholders),
  ], [richText, placeholders])
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        id,
        role: 'textbox',
        'aria-label': label,
        'aria-multiline': String(richText),
        'aria-readonly': String(disabled),
        'aria-invalid': String(Boolean(error)),
        ...(error ? { 'aria-describedby': `${id}-error` } : {}),
        class: richText ? 'template-editor-content' : 'template-editor-content template-editor-title',
      },
      handleKeyDown: (_view, event) => !richText && event.key === 'Enter',
      transformPastedText: (text) => richText ? text : text.replace(/[\r\n]+/g, ' '),
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : richText ? serializeTemplateHtml(current.getHTML()) : current.getText({ blockSeparator: ' ' })),
    onFocus: ({ editor: current }) => onFocus(current),
    onBlur,
  })

  useEffect(() => { editor?.setEditable(!disabled, false) }, [editor, disabled])
  const tools = editor ? [
    { label: 'Pogrubienie', icon: Bold, active: editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run() },
    { label: 'Kursywa', icon: Italic, active: editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run() },
    { label: 'Podkreślenie', icon: Underline, active: editor.isActive('underline'), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: 'Nagłówek 2', icon: Heading2, active: editor.isActive('heading', { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Nagłówek 3', icon: Heading3, active: editor.isActive('heading', { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Lista punktowana', icon: List, active: editor.isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Lista numerowana', icon: ListOrdered, active: editor.isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run() },
  ] : []

  return (
    <section className={cn('overflow-hidden rounded-xl border bg-card', active && 'border-primary', error && 'border-destructive')}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <label htmlFor={id} className="text-sm font-semibold">{label}</label>
        <span className="text-xs text-muted-foreground">{richText ? 'Tekst formatowany' : 'Tekst w jednej linii'}</span>
      </div>
      {!disabled && editor && (
        <div role="group" aria-label={`Formatowanie: ${label}`} className="flex flex-wrap gap-1 border-b bg-muted/30 px-3 py-2">
          {richText && tools.map((tool) => (
            <Button key={tool.label} type="button" variant={tool.active ? 'secondary' : 'ghost'} size="icon-sm"
              title={tool.label} aria-label={tool.label} aria-pressed={tool.active}
              onMouseDown={(event) => event.preventDefault()} onClick={tool.run}>
              <tool.icon aria-hidden="true" />
            </Button>
          ))}
          <Button type="button" variant="ghost" size="icon-sm" title="Cofnij" aria-label="Cofnij" disabled={!editor.can().undo()}
            onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().undo().run()}><Undo2 aria-hidden="true" /></Button>
          <Button type="button" variant="ghost" size="icon-sm" title="Ponów" aria-label="Ponów" disabled={!editor.can().redo()}
            onMouseDown={(event) => event.preventDefault()} onClick={() => editor.chain().focus().redo().run()}><Redo2 aria-hidden="true" /></Button>
        </div>
      )}
      <EditorContent editor={editor} />
      {error && <p id={`${id}-error`} role="alert" className="px-4 pb-3 text-xs text-destructive">{error}</p>}
    </section>
  )
}
