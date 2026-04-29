import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { useEffect } from 'react'
import { tableToTipTapDoc, tipTapDocToTable } from '../../../lib/houseRules/table'

function TableMenuButton({ onClick, children, label }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="px-2 py-1 text-xs font-heading rounded border border-gold-dim/30 text-parchment/70 hover:text-gold-light hover:border-gold-dim/60 transition-colors"
    >
      {children}
    </button>
  )
}

export default function TableBlockEditor({ block, onChange }) {
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
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: tableToTipTapDoc({ headers: block.headers ?? [], rows: block.rows ?? [] }),
    onUpdate: ({ editor }) => {
      const next = tipTapDocToTable(editor.getJSON())
      onChange({ ...block, ...next })
    },
  })

  useEffect(() => {
    return () => editor?.destroy()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gold-dim/20 rounded-md">
      <div className="flex flex-wrap gap-1 p-1 border-b border-gold-dim/20 bg-elevated/40">
        <TableMenuButton onClick={() => editor.chain().focus().addRowAfter().run()} label="Add row below">+ row below</TableMenuButton>
        <TableMenuButton onClick={() => editor.chain().focus().addRowBefore().run()} label="Add row above">+ row above</TableMenuButton>
        <TableMenuButton onClick={() => editor.chain().focus().addColumnAfter().run()} label="Add column right">+ col right</TableMenuButton>
        <TableMenuButton onClick={() => editor.chain().focus().addColumnBefore().run()} label="Add column left">+ col left</TableMenuButton>
        <TableMenuButton onClick={() => editor.chain().focus().deleteRow().run()} label="Delete row">- row</TableMenuButton>
        <TableMenuButton onClick={() => editor.chain().focus().deleteColumn().run()} label="Delete column">- col</TableMenuButton>
      </div>
      <EditorContent
        editor={editor}
        className="p-3 text-parchment/85 font-body focus:outline-none [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gold-dim/30 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:bg-elevated/60 [&_th]:text-muted [&_th]:font-heading [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_td]:border [&_td]:border-gold-dim/20 [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm"
      />
    </div>
  )
}
