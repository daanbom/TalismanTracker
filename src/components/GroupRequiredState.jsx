import { Link } from 'react-router-dom'

export default function GroupRequiredState({
  title = 'Select a group first',
  body = 'Games are scoped to a specific group. Choose an active group or create one to continue.',
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card-ornate bg-surface border border-gold-dim/15 rounded-xl p-6 sm:p-8 text-center animate-fade-up">
        <h1 className="font-heading text-2xl text-parchment tracking-wide">{title}</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <p className="text-muted font-body mt-4 max-w-xl mx-auto">{body}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/groups" className="btn-outline text-sm">
            Browse Groups
          </Link>
          <Link to="/groups/new" className="btn-gold text-sm">
            Create Group
          </Link>
        </div>
      </div>
    </div>
  )
}
