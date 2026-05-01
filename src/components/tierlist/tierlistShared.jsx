import { useState } from 'react'
import { EXPANSION_LABELS, detailSrcFor } from './tierlistConfig'

export function EntityImage({ src, name, className, fallbackTextSize = 'text-xs' }) {
  const [errored, setErrored] = useState(false)
  if (errored) {
    return (
      <div className={`${className} flex items-center justify-center bg-deep`}>
        <span className={`font-heading text-gold-dim ${fallbackTextSize} text-center px-1`}>
          {name}
        </span>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={name}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}

export function DetailPanel({ item, listType, hoverText }) {
  const isPet = listType === 'pet'
  const detailFrameClass = isPet
    ? 'w-full max-w-sm aspect-[5/7] rounded-lg overflow-hidden border border-gold-dim/40 bg-deep shadow-2xl shadow-black/70'
    : 'w-full max-w-lg aspect-[3/2] rounded-lg overflow-hidden border border-gold-dim/40 bg-deep shadow-2xl shadow-black/70'

  if (!item) {
    return (
      <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 flex items-center justify-center min-h-28">
        <p className="text-muted text-sm font-body italic">{hoverText}</p>
      </div>
    )
  }

  function PetDetailArtwork() {
    const [failed, setFailed] = useState(false)
    if (failed) {
      return (
        <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 text-center">
          <p className="font-heading text-lg text-gold-light">{item.name}</p>
          <p className="text-sm font-body text-parchment/80">
            {item.ability_text ?? 'Image coming soon.'}
          </p>
        </div>
      )
    }
    return (
      <img
        src={detailSrcFor(item, listType)}
        alt={item.name}
        className="w-full h-full object-contain p-1 bg-surface"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="bg-surface border border-gold-dim/20 rounded-xl p-6 flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-xs font-body text-gold-dim uppercase tracking-widest mb-1">
          {EXPANSION_LABELS[item.expansion] ?? item.expansion ?? ''}
        </p>
        <h3 className="font-heading text-2xl text-parchment tracking-wide">{item.name}</h3>
      </div>
      <div className={detailFrameClass}>
        {listType === 'pet' ? (
          <PetDetailArtwork key={item.key} />
        ) : (
          <EntityImage
            src={detailSrcFor(item, listType)}
            name={item.name}
            className="w-full h-full object-cover"
            fallbackTextSize="text-base"
          />
        )}
      </div>
      {listType === 'pet' && item.ability_text && (
        <p className="text-sm font-body text-parchment/80 text-center max-w-lg">
          {item.ability_text}
        </p>
      )}
    </div>
  )
}
