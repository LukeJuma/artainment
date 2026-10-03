import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { talentAPI, type Talent } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import { MediaArt } from '../components/ui/MediaArt'
import { IconInstagram, IconTwitter, IconFacebook, IconTikTok, IconLinkedin, IconGlobe } from '../components/ui/Icons'

export function TalentDetailPage() {
  const { slug } = useParams()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => { if (!slug) return; talentAPI.get(slug).then(setTalent).catch(() => setError(true)) }, [slug])

  if (error) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: 'var(--text)', marginBottom: 24 }}>Actor not found.</p>
        <Button to="/actors" variant="outline">Browse Actors</Button>
      </div>
    )
  }
  if (!talent) return <Loader />

  return (
    <div style={{ paddingTop: 0 }}>
      {/* Cinematic hero */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--ds-ink-950)' }}>
        {talent.image_url ? (
          <img src={talent.image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.35 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(1000px 500px at 50% 0%, rgba(225,29,72,0.16), transparent 60%), linear-gradient(160deg, #17151b 0%, #0d0d0f 60%)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'var(--ds-scrim-bottom)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: 'clamp(110px, 16vh, 150px) clamp(20px, 5vw, 48px) clamp(36px, 6vh, 56px)' }}>
          <nav aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 28 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>/</span>
            <Link to="/actors" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Actors</Link>
            <span style={{ color: 'rgba(255,255,255,0.35)' }}>/</span>
            <span style={{ color: '#fff' }}>{talent.name}</span>
          </nav>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 280px) 1fr', gap: 'clamp(24px, 5vw, 64px)', alignItems: 'end' }} className="actor-hero-grid">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              style={{ borderRadius: 'var(--ds-radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', aspectRatio: '3/4', background: 'var(--ds-ink-800)' }}
            >
              <MediaArt type="actor" title={talent.name} src={talent.image_url} alt={talent.name} absolute={false} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ width: 28, height: 2, background: 'var(--ds-gold)' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Actors
                </span>
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(52px, 8vw, 100px)', lineHeight: 0.95, color: '#fff', margin: '0 0 12px' }}>
                {talent.name}
              </h1>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, color: 'var(--ds-gold)', textTransform: 'uppercase' }}>
                  {talent.role}
                </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                  {talent.credits} credits
                </span>
              </div>
              {talent.bio && (
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.82)', margin: '0 0 24px', maxWidth: 560 }}>
                  {talent.bio}
                </p>
              )}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button to="/actors" variant="light">All Actors</Button>
                {talent.socials && Object.keys(talent.socials).length > 0 && (
                  <span style={{ display: 'inline-flex', gap: 8, marginLeft: 4 }}>
                    {Object.entries(talent.socials).map(([key, url]) => url && (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={key}
                        style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', transition: 'border-color 0.2s' }}
                      >
                        {key === 'instagram' ? <IconInstagram size={16} /> :
                          key === 'twitter' ? <IconTwitter size={16} /> :
                          key === 'facebook' ? <IconFacebook size={16} /> :
                          key === 'tiktok' ? <IconTikTok size={16} /> :
                          key === 'linkedin' ? <IconLinkedin size={16} /> :
                          <IconGlobe size={16} />}
                      </a>
                    ))}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 760px) {
          .actor-hero-grid { grid-template-columns: 200px 1fr !important; }
        }
        @media (max-width: 560px) {
          .actor-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
