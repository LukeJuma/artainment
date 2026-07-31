export function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div style={{ width: 28, height: 2, background: 'var(--red)' }} />
      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 3, color: 'var(--red)', textTransform: 'uppercase', fontWeight: 600 }}>{text}</span>
    </div>
  )
}
