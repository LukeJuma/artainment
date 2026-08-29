import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { talentAPI, type Talent } from '../lib/api'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Loader } from '../components/ui/Loader'
import { MediaArt } from '../components/ui/MediaArt'
import { IconInstagram, IconTwitter, IconFacebook, IconTikTok, IconLinkedin, IconGlobe } from '../components/ui/Icons'

export function TalentDetailPage() {
  const { slug } = useParams()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { if (!slug) return; talentAPI.get(slug).then(setTalent).catch(() => setError(true)) }, [slug])

  if (error) return <div style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text)', fontFamily: 'Chonburi, cursive', fontSize: 24 }}>Talent not found.</div>
  if (!talent) return <Loader />

  return (
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div className="talent-detail-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(24px, 4vw, 60px)', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--bg-muted)' }}>
            <MediaArt type="actor" title={talent.name} src={talent.image_url} alt={talent.name} absolute={false} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <SectionLabel text="Our Actors" />
            <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{talent.name}</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, margin: '0 0 24px' }}>{talent.role}</p>
            <div style={{ fontFamily: 'Chonburi, cursive', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>{talent.credits} credits</div>
            {talent.bio && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{talent.bio}</p>}
            {talent.socials && Object.keys(talent.socials).length > 0 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                {Object.entries(talent.socials).map(([key, url]) => url && (
                  <a key={key} href={url} target="_blank" rel="noreferrer" aria-label={key}
                    style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', transition: 'color 0.2s, border-color 0.2s', background: 'var(--bg-muted)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                    {key === 'instagram' ? <IconInstagram size={17} /> :
                      key === 'twitter' ? <IconTwitter size={17} /> :
                      key === 'facebook' ? <IconFacebook size={17} /> :
                      key === 'tiktok' ? <IconTikTok size={17} /> :
                      key === 'linkedin' ? <IconLinkedin size={17} /> :
                      <IconGlobe size={17} />}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
