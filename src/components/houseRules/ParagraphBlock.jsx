export default function ParagraphBlock({ block }) {
  return (
    <div
      className="text-parchment/85 font-body text-sm leading-relaxed prose-house"
      dangerouslySetInnerHTML={{ __html: block.html ?? '' }}
    />
  )
}
