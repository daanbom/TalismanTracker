import { useState, useMemo, useEffect } from 'react'
import { Link, useBeforeUnload } from 'react-router-dom'
import {
  PARAGRAPH, BULLETS, TABLE,
  newSection, newBox, newBlockOfKind,
  moveItemUp, moveItemDown, removeItemAt, replaceItemAt,
} from '../lib/houseRules/newDoc'
import BlockToolbar from '../components/houseRules/editor/BlockToolbar'
import AddBlockPopover from '../components/houseRules/editor/AddBlockPopover'
import StickySaveBar from '../components/houseRules/editor/StickySaveBar'
import ParagraphBlockEditor from '../components/houseRules/editor/ParagraphBlockEditor'
import BulletsBlockEditor from '../components/houseRules/editor/BulletsBlockEditor'
import TableBlockEditor from '../components/houseRules/editor/TableBlockEditor'

function BlockEditor({ block, onChange }) {
  if (block.kind === PARAGRAPH) return <ParagraphBlockEditor block={block} onChange={onChange} />
  if (block.kind === BULLETS) return <BulletsBlockEditor block={block} onChange={onChange} />
  if (block.kind === TABLE) return <TableBlockEditor block={block} onChange={onChange} />
  return null
}

function BlockEditorRow({ block, index, total, onChange, onMoveUp, onMoveDown, onDelete }) {
  return (
    <div className="border border-gold-dim/15 rounded-lg p-3 bg-surface/40">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-heading text-muted uppercase tracking-wider">{block.kind}</span>
        <BlockToolbar
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
        />
      </div>
      <BlockEditor block={block} onChange={onChange} />
    </div>
  )
}

function BoxEditor({ box, index, total, onChange, onMoveUp, onMoveDown, onDelete }) {
  const setTitle = (title) => onChange({ ...box, title })
  const setBlocks = (blocks) => onChange({ ...box, blocks })

  const updateBlockAt = (i, value) => setBlocks(replaceItemAt(box.blocks, i, value))
  const moveBlockUp = (i) => setBlocks(moveItemUp(box.blocks, i))
  const moveBlockDown = (i) => setBlocks(moveItemDown(box.blocks, i))
  const deleteBlock = (i) => setBlocks(removeItemAt(box.blocks, i))
  const addBlock = (kind) => setBlocks(box.blocks.concat([newBlockOfKind(kind)]))

  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl p-4 sm:p-5 space-y-3">
      <div className="flex items-start gap-2">
        <input
          type="text"
          value={box.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Box title"
          className="flex-1 bg-transparent border-b border-gold-dim/30 focus:border-gold-dim/80 outline-none font-heading text-lg text-gold tracking-wide pb-1"
        />
        <BlockToolbar
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
        />
      </div>

      {box.blocks.map((block, i) => (
        <BlockEditorRow
          key={block.id}
          block={block}
          index={i}
          total={box.blocks.length}
          onChange={(value) => updateBlockAt(i, value)}
          onMoveUp={() => moveBlockUp(i)}
          onMoveDown={() => moveBlockDown(i)}
          onDelete={() => deleteBlock(i)}
        />
      ))}

      <AddBlockPopover onAdd={addBlock} />
    </div>
  )
}

function SectionEditor({ section, index, total, onChange, onMoveUp, onMoveDown, onDelete }) {
  const setTitle = (title) => onChange({ ...section, title })
  const setBoxes = (boxes) => onChange({ ...section, boxes })

  const updateBoxAt = (i, value) => setBoxes(replaceItemAt(section.boxes, i, value))
  const moveBoxUp = (i) => setBoxes(moveItemUp(section.boxes, i))
  const moveBoxDown = (i) => setBoxes(moveItemDown(section.boxes, i))
  const deleteBox = (i) => setBoxes(removeItemAt(section.boxes, i))
  const addBox = () => setBoxes(section.boxes.concat([newBox()]))

  return (
    <section className="mb-10 last:mb-0">
      <div className="mb-5 flex items-center gap-3">
        <input
          type="text"
          value={section.title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Section title"
          className="flex-1 bg-transparent border-b border-gold-dim/30 focus:border-gold-dim/80 outline-none font-heading text-xl text-parchment tracking-wide pb-1"
        />
        <BlockToolbar
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {section.boxes.map((box, i) => (
          <BoxEditor
            key={box.id}
            box={box}
            index={i}
            total={section.boxes.length}
            onChange={(value) => updateBoxAt(i, value)}
            onMoveUp={() => moveBoxUp(i)}
            onMoveDown={() => moveBoxDown(i)}
            onDelete={() => deleteBox(i)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addBox}
        className="border border-dashed border-gold-dim/40 hover:border-gold-dim/80 text-parchment/70 hover:text-gold-light font-body text-sm px-4 py-2 rounded-md transition-colors"
      >
        + Add box
      </button>
    </section>
  )
}

export default function GroupHouseRulesEditor({
  groupName,
  initialDoc,
  initialUpdatedAt,
  onSave,
  onCancel,
  saving,
  staleConflict,
  onDismissStale,
}) {
  const [doc, setDoc] = useState(() => initialDoc ?? { sections: [] })
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(initialUpdatedAt)

  // If the parent re-fetches after a stale-write, sync the new server state in
  // while preserving the user's local edits to the doc.
  useEffect(() => {
    setExpectedUpdatedAt(initialUpdatedAt)
  }, [initialUpdatedAt])

  const dirty = useMemo(
    () => JSON.stringify(doc) !== JSON.stringify(initialDoc ?? { sections: [] }),
    [doc, initialDoc]
  )

  useBeforeUnload((event) => {
    if (dirty) {
      event.preventDefault()
      event.returnValue = ''
    }
  })

  const setSections = (sections) => setDoc({ ...doc, sections })
  const updateSectionAt = (i, value) => setSections(replaceItemAt(doc.sections, i, value))
  const moveSectionUp = (i) => setSections(moveItemUp(doc.sections, i))
  const moveSectionDown = (i) => setSections(moveItemDown(doc.sections, i))
  const deleteSection = (i) => setSections(removeItemAt(doc.sections, i))
  const addSection = () => setSections(doc.sections.concat([newSection()]))

  const handleCancel = () => {
    if (dirty) {
      const confirm = window.confirm('Discard unsaved changes?')
      if (!confirm) return
    }
    onCancel()
  }

  const handleSave = () => {
    onSave({ content: doc, expectedUpdatedAt })
  }

  // Auto-add one section if the user entered editing on an empty doc.
  useEffect(() => {
    if ((initialDoc?.sections ?? []).length === 0 && doc.sections.length === 0) {
      setSections([newSection()])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/house-rules"
          className="text-muted hover:text-gold-light font-body text-sm inline-flex items-center gap-1.5 mb-6 transition-colors"
        >
          <span aria-hidden>&larr;</span> Back to House Rules
        </Link>
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl text-parchment tracking-wide">
            Editing {groupName} House Rules
          </h1>
          <div className="ornament-divider mt-3">
            <span className="text-gold-dim">&#9670;</span>
          </div>
        </div>

        {staleConflict && (
          <div className="mb-6 border border-amber-400/40 bg-amber-400/10 text-amber-100 px-4 py-3 rounded-md flex items-start justify-between gap-4 font-body text-sm">
            <span>
              Someone else saved while you were editing. Your changes are kept locally.
              Click Save again to overwrite, or Cancel to discard.
            </span>
            <button
              type="button"
              onClick={onDismissStale}
              className="text-amber-200 hover:text-amber-100 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {doc.sections.map((section, i) => (
          <SectionEditor
            key={section.id}
            section={section}
            index={i}
            total={doc.sections.length}
            onChange={(value) => updateSectionAt(i, value)}
            onMoveUp={() => moveSectionUp(i)}
            onMoveDown={() => moveSectionDown(i)}
            onDelete={() => deleteSection(i)}
          />
        ))}

        <div className="mt-6">
          <button
            type="button"
            onClick={addSection}
            className="border border-dashed border-gold-dim/40 hover:border-gold-dim/80 text-parchment/70 hover:text-gold-light font-body text-sm px-5 py-2 rounded-md transition-colors"
          >
            + Add section
          </button>
        </div>
      </div>

      <StickySaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}
