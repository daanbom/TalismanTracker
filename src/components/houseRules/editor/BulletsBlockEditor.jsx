import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import { bulletsToTipTapDoc, tipTapDocToBullets } from '../../../lib/houseRules/bullets'

export default function BulletsBlockEditor({ block, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        orderedList: false,
        bulletList: { keepMarks: true, keepAttributes: false },
        listItem: {},
      }),
    ],
    content: bulletsToTipTapDoc(block.items ?? []),
    onUpdate: ({ editor }) => {
      const items = tipTapDocToBullets(editor.getJSON())
      onChange({ ...block, items })
    },
  })

  // Nesting beyond two levels is dropped silently by `tipTapDocToBullets`,
  // so we do not need a runtime depth cap. The transform is the source of truth.

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gold-dim/20 rounded-md">
      <div className="flex gap-1 p-1 border-b border-gold-dim/20 bg-elevated/40">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().sinkListItem('listItem').run()}
          className="px-2 py-1 text-xs font-heading rounded border border-gold-dim/30 text-parchment/70 hover:text-gold-light hover:border-gold-dim/60"
        >
          Indent
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().liftListItem('listItem').run()}
          className="px-2 py-1 text-xs font-heading rounded border border-gold-dim/30 text-parchment/70 hover:text-gold-light hover:border-gold-dim/60"
        >
          Outdent
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 text-parchment/85 font-body focus:outline-none"
      />
    </div>
  )
}
