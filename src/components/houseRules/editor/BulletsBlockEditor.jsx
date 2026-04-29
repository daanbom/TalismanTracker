import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { bulletsToTipTapDoc, tipTapDocToBullets } from '../../../lib/houseRules/bullets'

function isNestedListItemSelection(editor) {
  const { $from } = editor.state.selection

  let currentListItemDepth = -1
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === 'listItem') {
      currentListItemDepth = depth
      break
    }
  }
  if (currentListItemDepth === -1) return false

  for (let depth = currentListItemDepth - 1; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === 'listItem') return true
  }
  return false
}

function getListItemDepth(editor) {
  const { $from } = editor.state.selection
  let depth = 0

  for (let i = 1; i <= $from.depth; i += 1) {
    if ($from.node(i).type.name === 'listItem') depth += 1
  }

  return depth
}

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

  const [depth, setDepth] = useState(1)

  useEffect(() => {
    if (!editor) return undefined
    const syncDepth = () => setDepth(getListItemDepth(editor))
    syncDepth()
    editor.on('selectionUpdate', syncDepth)
    editor.on('update', syncDepth)
    return () => {
      editor.off('selectionUpdate', syncDepth)
      editor.off('update', syncDepth)
    }
  }, [editor])

  // Nesting beyond two levels is dropped silently by `tipTapDocToBullets`,
  // so we do not need a runtime depth cap. The transform is the source of truth.

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  if (!editor) return null

  const canIndent = depth < 2
  const canOutdent = depth > 1

  const handleIndent = () => {
    // Storage supports one nested level for bullets.
    if (!canIndent) return
    editor.chain().focus().sinkListItem('listItem').run()
  }

  const handleOutdent = () => {
    // Prevent lifting top-level bullets out of the list structure.
    if (!isNestedListItemSelection(editor)) return
    editor.chain().focus().liftListItem('listItem').run()
  }

  return (
    <div className="border border-gold-dim/20 rounded-md">
      <div className="flex flex-wrap items-center gap-1 p-1 border-b border-gold-dim/20 bg-elevated/40">
        <button
          type="button"
          disabled={!canIndent}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleIndent}
          className="px-2 py-1 text-xs font-heading rounded border border-gold-dim/30 text-parchment/70 hover:text-gold-light hover:border-gold-dim/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-parchment/70 disabled:hover:border-gold-dim/30"
        >
          Indent
        </button>
        <button
          type="button"
          disabled={!canOutdent}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleOutdent}
          className="px-2 py-1 text-xs font-heading rounded border border-gold-dim/30 text-parchment/70 hover:text-gold-light hover:border-gold-dim/60 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-parchment/70 disabled:hover:border-gold-dim/30"
        >
          Outdent
        </button>
        <span className="ml-auto text-[11px] font-heading uppercase tracking-wider text-muted pr-1">
          Level {Math.max(1, depth)}
        </span>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-3 text-parchment/85 font-body focus:outline-none"
      />
    </div>
  )
}
