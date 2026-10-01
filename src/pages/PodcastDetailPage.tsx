import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { podcastAPI, videoStreamUrl, type Podcast, type PodcastEpisode } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { MediaArt } from '../components/ui/MediaArt'
import { parseYouTubeId } from '../components/ui/YouTubePlayer'
import { IconPlay, IconX } from '../components/ui/Icons'

function episodeThumb(ep: PodcastEpisode, fallbackCover?: string | null): string | null {
  const yt = parseYouTubeId(ep.video_url)
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`
  return fallbackCover || null
}

export function PodcastDetailPage() {
  const { slug } = useParams()
  const [podcast, setPodcast] = useState<Podcast | null>(null)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState<PodcastEpisode | null>(null)

  useEffect(() => {
    if (!slug) return
    podcastAPI.get(slug).then(setPodcast).catch(() => setError(true))
  }, [slug])

  if (error) return <div style={{ paddingTop: 80, textAlign: 'center', color: 'var(--text)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>Podcast not found.</div>
  if (!podcast) return <Loader />

  const episodes = podcast.episodes ?? []
  const hasMedia = (e: PodcastEpisode) => Boolean(e.audio_url || e.video_url)

  return (
    <div style={{ paddingTop: 80 }}>
      <Section style={{ background: 'var(--bg-muted)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(220px, 300px) 1fr', gap: 'clamp(24px, 4vw, 56px)', alignItems: 'start' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            style={{ borderRadius: 12, overflow: 'hidden', background: 'var(--bg)' }}>
            <MediaArt type="podcast" title={podcast.title} src={podcast.cover_url} alt={podcast.title} absolute={false} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
            <SectionLabel text={podcast.episodes?.some(e => e.video_url) ? 'Watch & Listen' : 'Listen'} />
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px' }}>{podcast.title}</h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, margin: '0 0 16px' }}>
              {podcast.host}{podcast.category ? ` · ${podcast.category}` : ''}
            </p>
            {podcast.description && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>{podcast.description}</p>}
          </motion.div>
        </div>
      </Section>

      <Section>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: 'var(--text)', margin: '0 0 24px' }}>Episodes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {episodes.map(ep => {
              const playable = hasMedia(ep)
              const thumb = episodeThumb(ep, podcast.cover_url)
              return (
                <motion.div
                  key={ep.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={playable ? { y: -3 } : {}}
                  className="ep-row"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 18, padding: 14,
                    background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)',
                    borderRadius: 'var(--ds-radius-md)', boxShadow: 'var(--ds-card-shadow)',
                  }}
                >
                  <button
                    onClick={() => playable && setPlaying(ep)}
                    disabled={!playable}
                    aria-label={playable ? `Play ${ep.title}` : `${ep.title} coming soon`}
                    style={{
                      position: 'relative', width: 168, aspectRatio: '16/9', flexShrink: 0,
                      borderRadius: 'var(--ds-radius-sm)', overflow: 'hidden', padding: 0,
                      border: '1px solid var(--ds-card-line)', cursor: playable ? 'pointer' : 'not-allowed',
                      background: 'linear-gradient(160deg, var(--ds-surface-2), var(--ds-surface))',
                    }}
                  >
                    {thumb ? (
                      <img src={thumb} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: 'var(--ds-text-3)' }}>
                        {String(ep.episode_number).padStart(2, '0')}
                      </span>
                    )}
                    <span style={{
                      position: 'absolute', top: 6, left: 6,
                      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                      color: '#fff', fontFamily: "'Bebas Neue', sans-serif", fontSize: 13,
                      minWidth: 24, height: 24, padding: '0 6px', borderRadius: 6,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {ep.episode_number}
                    </span>
                    {playable && (
                      <span style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.25)',
                      }}>
                        <span style={{
                          width: 46, height: 46, borderRadius: '50%', background: 'var(--ds-brand)',
                          boxShadow: 'var(--ds-shadow-glow-brand)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <IconPlay size={17} color="#fff" />
                        </span>
                      </span>
                    )}
                  </button>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Episode {ep.episode_number}</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, letterSpacing: '0.02em', color: 'var(--text)' }}>{ep.title}</div>
                    {ep.description && <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-muted)', marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{ep.description}</div>}
                  </div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {ep.duration || ''}
                  </div>
                </motion.div>
              )
            })}
            {episodes.length === 0 && (
              <div style={{ textAlign: 'center', padding: 48, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-muted)' }}>No episodes yet.</div>
            )}
          </div>
        </div>
      </Section>

      <AnimatePresence>
        {playing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPlaying(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }} transition={{ duration: 0.25 }} onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: 520, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, color: 'var(--text)' }}>{playing.title}</div>
                <button onClick={() => setPlaying(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', minHeight: 40, minWidth: 40, alignItems: 'center', justifyContent: 'center' }} aria-label="Close">
                  <IconX size={18} />
                </button>
              </div>
              {playing.video_url ? (
                <video controls autoPlay playsInline src={videoStreamUrl(playing.video_url) ?? undefined} style={{ width: '100%', borderRadius: 8, background: '#000', aspectRatio: '16 / 9' }} />
              ) : playing.audio_url ? (
                <audio controls autoPlay src={videoStreamUrl(playing.audio_url) ?? undefined} style={{ width: '100%' }} />
              ) : (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>Media coming soon.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
