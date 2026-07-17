import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { talentAPI, type Talent } from '../lib/api'
import { imgOr } from '../lib/utils'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Loader } from '../components/ui/Loader'

export function TalentDetailPage() {
  const { slug } = useParams()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { if (!slug) return; talentAPI.get(slug).then(setTalent).catch(() => setError(true)) }, [slug])

  if (error) return <div style={{ paddingTop: 120, textAlign: 'center', color: '#fff', fontFamily: 'Clash Display, sans-serif', fontSize: 24 }}>Talent not found.</div>
  if (!talent) return <Loader />

  return (
    <div style={{ paddingTop: 100 }}>
      <Section>
        <div className="talent-detail-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 60, alignItems: 'start' }}>
          <div style={{ borderRadius: 8, overflow: 'hidden', background: '#2d2c30' }}>
            <img src={imgOr('talent', talent.image_url)} alt={talent.name}
              style={{ width: '100%', display: 'block' }} />
          </div>
          <div>
            <SectionLabel text="The Collective" />
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{talent.name}</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#F00000', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, margin: '0 0 24px' }}>{talent.role}</p>
            <div style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32 }}>{talent.credits} credits</div>
            {talent.bio && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{talent.bio}</p>}
          </div>
        </div>
      </Section>
    </div>
  )
}
