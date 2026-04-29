export default function StickySaveBar({ dirty, saving, onSave, onCancel }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 bg-elevated/95 border-t border-gold-dim/30 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="text-sm font-body text-parchment/70 flex items-center gap-2">
          {dirty ? (
            <>
              <span aria-hidden className="w-2 h-2 rounded-full bg-gold-light" />
              <span>Unsaved changes</span>
            </>
          ) : (
            <span className="text-muted">No changes</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="border border-gold-dim/30 hover:border-gold-dim/60 text-parchment/80 hover:text-parchment font-body text-sm px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!dirty || saving}
            className="bg-gold/20 hover:bg-gold/30 border border-gold-dim/60 text-gold-light hover:text-gold font-heading text-sm tracking-wide px-5 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
