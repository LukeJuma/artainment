export function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
      <div style={{ width: 32, height: 1, background: '#F00000' }} />
      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 4, color: '#F00000', textTransform: 'uppercase', fontWeight: 600 }}>{text}</span>
    </div>
  )
}
