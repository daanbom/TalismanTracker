import { HOUSE_RULES, RULEBOOKS } from '../data/houseRules'

function RuleItem({ rule }) {
  if (typeof rule === 'string') {
    return (
      <li className="flex gap-3 text-parchment/85 font-body text-sm leading-relaxed">
        <span className="text-gold-dim flex-shrink-0 mt-1.5 text-xs">&#9670;</span>
        <span>{rule}</span>
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-2">
      <div className="flex gap-3 text-parchment/85 font-body text-sm leading-relaxed">
        <span className="text-gold-dim flex-shrink-0 mt-1.5 text-xs">&#9670;</span>
        <span>{rule.text}</span>
      </div>
      {rule.subrules?.length > 0 && (
        <ul className="ml-6 space-y-1.5">
          {rule.subrules.map((sub, i) => (
            <li
              key={i}
              className="flex gap-3 text-parchment/70 font-body text-sm leading-relaxed"
            >
              <span className="text-gold-dim/60 flex-shrink-0 mt-1.5 text-xs">&#9642;</span>
              <span>{sub}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function RulesTable({ table }) {
  return (
    <div className="mt-3">
      {table.title && (
        <h5 className="font-heading text-sm text-gold/80 tracking-wide mb-2">
          {table.title}
        </h5>
      )}
      <div className="border border-gold-dim/15 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-elevated/60">
            <tr>
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2 text-muted uppercase tracking-wider text-xs font-heading"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-gold-dim/10">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-2 ${
                      ci === 0 ? 'text-parchment/90' : 'text-parchment/80'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TopicCard({ topic }) {
  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl p-5 sm:p-6">
      <h4 className="font-heading text-lg text-gold tracking-wide mb-3">
        {topic.name}
      </h4>

      {topic.intro && (
        <p className="text-parchment/85 font-body text-sm leading-relaxed mb-3">
          {topic.intro}
        </p>
      )}

      {topic.tables?.map((table, i) => <RulesTable key={i} table={table} />)}

      {topic.rules?.length > 0 && (
        <ul className={`space-y-2 ${topic.tables?.length ? 'mt-4' : ''}`}>
          {topic.rules.map((rule, i) => (
            <RuleItem key={i} rule={rule} />
          ))}
        </ul>
      )}
    </div>
  )
}

function SectionBlock({ section }) {
  return (
    <section id={section.slug} className="mb-10 last:mb-0 scroll-mt-20">
      <div className="mb-5">
        <h3 className="font-heading text-xl text-parchment tracking-wide">
          {section.name}
        </h3>
        <div className="h-px bg-gradient-to-r from-gold-dim/40 via-gold-dim/10 to-transparent mt-2" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {section.topics.map((topic) => (
          <TopicCard key={topic.name} topic={topic} />
        ))}
      </div>
    </section>
  )
}

function RulesetBlock({ ruleset }) {
  return (
    <div className="mb-16 last:mb-0">
      <h2 className="font-display text-2xl sm:text-3xl text-gold tracking-wider mb-8 text-center">
        {ruleset.ruleset}
      </h2>
      {ruleset.sections.map((section) => (
        <SectionBlock key={section.slug} section={section} />
      ))}
    </div>
  )
}

function TableOfContents() {
  return (
    <nav className="bg-surface border border-gold-dim/15 rounded-xl p-5 mb-10 animate-fade-up delay-1">
      <h2 className="font-heading text-sm text-muted uppercase tracking-wider mb-3">
        Contents
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        {HOUSE_RULES.map((ruleset) => (
          <div key={ruleset.slug}>
            <p className="font-heading text-sm text-gold/80 tracking-wide mb-2">
              {ruleset.ruleset}
            </p>
            <ul className="space-y-1">
              {ruleset.sections.map((section) => (
                <li key={section.slug}>
                  <a
                    href={`#${section.slug}`}
                    className="text-parchment/70 hover:text-gold-light font-body text-sm transition-colors"
                  >
                    {section.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  )
}

export default function HouseRules() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up text-center">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">House Rules</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <p className="text-muted text-sm font-body mt-3">
          Tweaks and clarifications the fellowship plays by. By Joep &amp; Daan.
        </p>
      </div>

      <div className="bg-surface border border-gold-dim/15 rounded-xl p-5 mb-10 animate-fade-up delay-1">
        <h2 className="font-heading text-sm text-muted uppercase tracking-wider mb-3">
          Rulebooks
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {RULEBOOKS.map((book) => (
            <a
              key={book.name}
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-parchment/70 hover:text-gold-light font-body text-sm transition-colors"
            >
              <span className="text-gold-dim text-xs">&#9670;</span>
              {book.name}
            </a>
          ))}
        </div>
      </div>

      <TableOfContents />

      {HOUSE_RULES.map((ruleset) => (
        <RulesetBlock key={ruleset.slug} ruleset={ruleset} />
      ))}
    </div>
  )
}
