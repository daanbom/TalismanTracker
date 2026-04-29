import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'
import { sanitiseParagraphHtml } from '../../../lib/houseRules/sanitiseHtml'

function MenuButton({ active, onClick, children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 text-xs font-heading rounded border transition-colors ${
        active
          ? 'bg-gold/20 border-gold-dim/60 text-gold'
          : 'border-gold-dim/30 text-parchment/70 hover:text-gold-light hover:border-gold-dim/60'
      }`}
    >
      {children}
    </button>
  )
}

export default function ParagraphBlockEditor({ block, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: block.html ?? '<p></p>',
    onUpdate: ({ editor }) => {
      const html = sanitiseParagraphHtml(editor.getHTML())
      onChange({ ...block, html })
    },
  })

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  if (!editor) return null

  const promptForLink = () => {
    const previous = editor.getAttributes('link').href
    const url = window.prompt('Link URL (leave blank to remove):', previous ?? '')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="border border-gold-dim/20 rounded-md">
      <div className="flex gap-1 p-1 border-b border-gold-dim/20 bg-elevated/40">
        <MenuButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          label="Bold"
        >
          B
        </MenuButton>
        <MenuButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          label="Italic"
        >
          <em>I</em>
        </MenuButton>
        <MenuButton
          active={editor.isActive('link')}
          onClick={promptForLink}
          label="Link"
        >
          link
        </MenuButton>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 text-parchment/85 font-body focus:outline-none"
      />
    </div>
  )
}
