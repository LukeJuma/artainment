import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeading } from '../components/ui/SectionHeading';

const shell: React.CSSProperties = {
  background: 'var(--ds-ink-950)',
  color: 'var(--ds-fog-100)',
  minHeight: '100vh',
  padding: '120px clamp(20px, 5vw, 80px) 120px',
  fontFamily: "'DM Sans', sans-serif",
};

const wrap: React.CSSProperties = { maxWidth: 1100, margin: '0 auto' };

const block: React.CSSProperties = {
  background: 'var(--ds-ink-900)',
  border: '1px solid var(--ds-line)',
  borderRadius: 'var(--ds-radius-lg)',
  padding: 'clamp(20px, 4vw, 40px)',
  marginBottom: 24,
};

const blockTitle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 3,
  textTransform: 'uppercase',
  color: 'var(--ds-fog-500)',
  margin: '0 0 24px',
};

const swatch = (bg: string, label: string, sub?: string) => (
  <div style={{ minWidth: 0 }}>
    <div
      style={{
        height: 72,
        borderRadius: 'var(--ds-radius-md)',
        background: bg,
        border: '1px solid var(--ds-line)',
        marginBottom: 8,
      }}
    />
    <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--ds-fog-500)', fontFamily: 'monospace' }}>{sub}</div>}
  </div>
);

const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 16,
};

export function DesignSystemPage() {
  return (
    <div style={shell}>
      <div style={wrap}>
        <SectionHeading
          eyebrow="Artainment DS v1"
          title="Design System"
          sub="Dark-cinematic token layer and primitives. Nothing on this page ships to production surfaces â€” pages adopt these pieces incrementally."
        />

        {/* â”€â”€ Palette â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Palette â€” Brand (evolved crimson)</p>
          <div style={grid}>
            {swatch('var(--ds-brand-950)', 'Crimson 950', '#1a0508')}
            {swatch('var(--ds-brand-900)', 'Crimson 900', '#3d0a10')}
            {swatch('var(--ds-brand-700)', 'Crimson 700', '#b91c1c')}
            {swatch('var(--ds-brand-600)', 'Brand 600', '#e11d48')}
            {swatch('var(--ds-brand-500)', 'Brand 500', '#f43f5e')}
            {swatch('var(--ds-brand-400)', 'Brand 400', '#fb7185')}
          </div>
          <p style={{ ...blockTitle, marginTop: 32 }}>Palette â€” Gold (ratings, featured, awards)</p>
          <div style={grid}>
            {swatch('var(--ds-gold-600)', 'Gold 600', '#b07f2e')}
            {swatch('var(--ds-gold-500)', 'Gold 500', '#d4a24e')}
            {swatch('var(--ds-gold-400)', 'Gold 400', '#e8b64c')}
          </div>
          <p style={{ ...blockTitle, marginTop: 32 }}>Palette â€” Ink surfaces</p>
          <div style={grid}>
            {swatch('var(--ds-ink-950)', 'Ink 950', '#08080a')}
            {swatch('var(--ds-ink-900)', 'Ink 900', '#0d0d10')}
            {swatch('var(--ds-ink-850)', 'Ink 850', '#121216')}
            {swatch('var(--ds-ink-800)', 'Ink 800', '#17171c')}
            {swatch('var(--ds-ink-700)', 'Ink 700', '#1f1f26')}
          </div>
          <p style={{ ...blockTitle, marginTop: 32 }}>Palette â€” Fog text</p>
          <div style={grid}>
            {swatch('var(--ds-fog-100)', 'Fog 100', '#f5f3ee')}
            {swatch('var(--ds-fog-300)', 'Fog 300', '#c9c5bd')}
            {swatch('var(--ds-fog-500)', 'Fog 500', '#8a877f')}
            {swatch('var(--ds-fog-600)', 'Fog 600', '#6b6963')}
          </div>
        </div>

        {/* â”€â”€ Typography â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Typography</p>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--ds-brand-400)', marginBottom: 12 }}>
            EYEBROW â€” TRACKED LABEL
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--ds-display-xl)', lineHeight: 1 }}>Display XL</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--ds-display-lg)', lineHeight: 1.05, marginTop: 16 }}>
            Display LG
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--ds-display-md)', lineHeight: 1.1, marginTop: 16 }}>
            Display MD
          </div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, lineHeight: 1.7, color: 'var(--ds-fog-300)', marginTop: 16, maxWidth: 640 }}>
            Body â€” DM Sans at 16px/1.7. Fog 300 keeps long-form reading comfortable on near-black without halation.
          </div>
          <div style={{ fontFamily: "'Domine', serif", fontSize: 19, lineHeight: 1.6, color: 'var(--ds-fog-300)', marginTop: 12, maxWidth: 640 }}>
            Accent â€” Domine serif for pull-quotes and editorial moments.
          </div>
        </div>

        {/* â”€â”€ Buttons â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Buttons</p>
          {(['primary', 'gold', 'outline', 'ghost', 'light'] as const).map(v => (
            <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{ width: 90, fontSize: 12, color: 'var(--ds-fog-500)', textTransform: 'capitalize' }}>{v}</span>
              <Button variant={v} size="sm">Small</Button>
              <Button variant={v} size="md">Medium</Button>
              <Button variant={v} size="lg">Large</Button>
              <Button variant={v} size="md" disabled>
                Disabled
              </Button>
            </div>
          ))}
        </div>

        {/* â”€â”€ Badges â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Badges</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Badge variant="brand">Featured</Badge>
            <Badge variant="gold">Top Rated</Badge>
            <Badge variant="live">Now Showing</Badge>
            <Badge variant="upcoming">Coming Soon</Badge>
            <Badge variant="outline">Series</Badge>
            <Badge variant="muted">Drama</Badge>
          </div>
        </div>

        {/* â”€â”€ Section headings â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Section headings</p>
          <SectionHeading eyebrow="Now Streaming" title="Featured Movies" sub="Hand-picked premieres, festival winners and audience favourites." />
          <div style={{ height: 8 }} />
          <SectionHeading
            align="center"
            eyebrow="Listen"
            title="Podcasts"
            sub="Conversations with the people shaping Kenyan film and culture."
          />
        </div>

        {/* â”€â”€ Elevation, radii, motion â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Elevation & glow</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 180, height: 110, borderRadius: 'var(--ds-radius-md)', background: 'var(--ds-ink-800)', boxShadow: 'var(--ds-shadow-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--ds-fog-500)' }}>
              card
            </div>
            <div style={{ width: 180, height: 110, borderRadius: 'var(--ds-radius-md)', background: 'var(--ds-ink-800)', boxShadow: 'var(--ds-shadow-lift)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--ds-fog-500)' }}>
              lift
            </div>
            <div style={{ width: 180, height: 110, borderRadius: 'var(--ds-radius-md)', background: 'var(--ds-brand)', boxShadow: 'var(--ds-shadow-glow-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 700 }}>
              glow brand
            </div>
            <div style={{ width: 180, height: 110, borderRadius: 'var(--ds-radius-md)', background: 'var(--ds-gold)', boxShadow: 'var(--ds-shadow-glow-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#1a1206', fontWeight: 700 }}>
              glow gold
            </div>
          </div>
          <p style={{ ...blockTitle, marginTop: 32 }}>Radii</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {([4, 8, 12, 16, 24, 999] as const).map(r => (
              <div key={r} style={{ textAlign: 'center' }}>
                <div style={{ width: 84, height: 84, borderRadius: r === 999 ? 'var(--ds-radius-pill)' : r, background: 'var(--ds-ink-700)', border: '1px solid var(--ds-line-strong)' }} />
                <div style={{ fontSize: 11, color: 'var(--ds-fog-500)', marginTop: 6, fontFamily: 'monospace' }}>
                  {r === 999 ? 'pill' : r}
                </div>
              </div>
            ))}
          </div>
          <p style={{ ...blockTitle, marginTop: 32 }}>Motion</p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ padding: '12px 24px', borderRadius: 'var(--ds-radius-pill)', background: 'var(--ds-brand)', fontSize: 12, fontWeight: 700, animation: 'ds-fade-up 1.2s var(--ds-ease-out) infinite alternate' }}>
              fade-up loop
            </div>
            <span style={{ fontSize: 12, color: 'var(--ds-fog-500)', fontFamily: 'monospace' }}>
              ease-out / ease-cinema Â· 150 / 250 / 500ms
            </span>
          </div>
        </div>

        {/* â”€â”€ Scrims â”€â”€ */}
        <div style={block}>
          <p style={blockTitle}>Scrims (text-over-artwork legibility)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {(
              [
                ['bottom', 'var(--ds-scrim-bottom)'],
                ['left', 'var(--ds-scrim-left)'],
                ['top', 'var(--ds-scrim-top)'],
              ] as const
            ).map(([name, scrim]) => (
              <div key={name} style={{ position: 'relative', height: 150, borderRadius: 'var(--ds-radius-md)', overflow: 'hidden', background: 'linear-gradient(135deg,#2a1420,#101828)' }}>
                <div style={{ position: 'absolute', inset: 0, background: scrim }} />
                <span style={{ position: 'absolute', left: 14, bottom: 12, fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 12, color: 'var(--ds-fog-600)', textAlign: 'center', marginTop: 8 }}>
          Internal preview â€” not linked from navigation. Tokens: <span style={{ fontFamily: 'monospace' }}>src/styles/tokens.css</span>
        </p>
      </div>
    </div>
  );
}
