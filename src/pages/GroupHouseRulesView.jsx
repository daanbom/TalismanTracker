import { Link } from 'react-router-dom'
import { PARAGRAPH, BULLETS, TABLE } from '../lib/houseRules/newDoc'
import ParagraphBlock from '../components/houseRules/ParagraphBlock'
import BulletsBlock from '../components/houseRules/BulletsBlock'
import TableBlock from '../components/houseRules/TableBlock'

function Block({ block }) {
  if (block.kind === PARAGRAPH) return <ParagraphBlock block={block} />
  if (block.kind === BULLETS) return <BulletsBlock block={block} />
  if (block.kind === TABLE) return <TableBlock block={block} />
  return null
}

function Box({ box }) {
  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl p-5 sm:p-6">
      <h4 className="font-heading text-lg text-gold tracking-wide mb-3">
        {box.title}
      </h4>
      <div className="space-y-4">
        {box.blocks.map((block) => (
          <Block key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}

function Section({ section }) {
  return (
    <section id={section.id} className="mb-10 last:mb-0 scroll-mt-20">
      <div className="mb-5">
        <h3 className="font-heading text-xl text-parchment tracking-wide">
          {section.title}
        </h3>
        <div className="h-px bg-gradient-to-r from-gold-dim/40 via-gold-dim/10 to-transparent mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {section.boxes.map((box) => (
          <Box key={box.id} box={box} />
        ))}
      </div>
    </section>
  )
}

function TableOfContents({ sections }) {
  if (sections.length === 0) return null
  return (
    <nav className="bg-surface border border-gold-dim/15 rounded-xl p-5 mb-10 animate-fade-up delay-1">
      <h2 className="font-heading text-sm text-muted uppercase tracking-wider mb-3">
        Contents
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-parchment/70 hover:text-gold-light font-body text-sm transition-colors"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function GroupHouseRulesView({ doc, groupName, onEnterEdit }) {
  const sections = doc?.sections ?? []

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/house-rules"
          className="text-muted hover:text-gold-light font-body text-sm inline-flex items-center gap-1.5 mb-6 transition-colors"
        >
          <span aria-hidden>&larr;</span> Back to House Rules
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="text-center flex-1">
            <h1 className="font-heading text-3xl text-parchment tracking-wide">
              {groupName} House Rules
            </h1>
            <div className="ornament-divider mt-3">
              <span className="text-gold-dim">&#9670;</span>
            </div>
          </div>
          {onEnterEdit && (
            <button
              type="button"
              onClick={onEnterEdit}
              className="border border-gold-dim/40 hover:border-gold-dim/80 text-gold-light hover:text-gold font-heading text-sm tracking-wide px-4 py-2 rounded-md transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <TableOfContents sections={sections} />

      {sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </div>
  )
}
