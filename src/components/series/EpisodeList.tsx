import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Episode, Series } from '../../lib/api'
import { parseYouTubeId } from '../ui/YouTubePlayer'
import { IconPlay } from '../ui/Icons'

function episodeThumb(ep: Episode): string | null {
  const yt = parseYouTubeId(ep.video_url)
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`
  return (ep as { poster_url?: string | null }).poster_url || null
}

interface EpisodeListProps {
  series: Series
  onPlayEpisode: (episode: Episode) => void
}

export function EpisodeList({ series, onPlayEpisode }: EpisodeListProps) {
  const seasons = series.seasons || []
  
  // Fix stale state: Initialize with default value, then sync with props
  const [activeSeason, setActiveSeason] = useState<number>(1)
  
  // Sync activeSeason with prop changes during navigation
  useEffect(() => {
    const defaultSeason = seasons.find(s => s.episodes?.some(e => e.video_url))?.season_number ?? seasons[0]?.season_number ?? 1
    setActiveSeason(defaultSeason)
  }, [series.id, seasons]) // Re-run when series changes or seasons change

  const current = seasons.find(s => s.season_number === activeSeason)

  return (
      <section style={{ padding: 'clamp(40px, 7vw, 72px) 0' }}>
        <div className="ep-list-pad" style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
            Episodes
          </h2>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
            {seasons.length} season{seasons.length > 1 ? 's' : ''} · {seasons.reduce((n, s) => n + (s.episodes?.length || 0), 0)} episodes
          </span>
        </div>

        {seasons.length > 1 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
            {seasons.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSeason(s.season_number)}
                style={{
                  background: activeSeason === s.season_number ? 'var(--red)' : 'transparent',
                  border: `1px solid ${activeSeason === s.season_number ? 'var(--red)' : 'var(--border)'}`,
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, letterSpacing: 1.5,
                  textTransform: 'uppercase', color: activeSeason === s.season_number ? 'var(--text)' : 'var(--text-secondary)',
                  padding: '10px 22px', minHeight: 40, borderRadius: 'var(--ds-radius-pill)', transition: 'all 0.2s', fontWeight: 600,
                }}
              >
                {s.title || `Season ${s.season_number}`}
              </button>
            ))}
          </div>
        )}

        {current?.synopsis && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 720, margin: '0 0 28px' }}>
            {current.synopsis}
          </p>
        )}

        <div style={{ borderTop: '1px solid var(--border)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? 'none'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {(current?.episodes || []).map(ep => {
                const playable = Boolean(ep.video_url)
                const thumb = episodeThumb(ep)
                return (
                  <div
                    key={ep.id}
                    className="ep-row"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 18, padding: '14px',
                      background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)',
                      borderRadius: 'var(--ds-radius-md)', marginBottom: 12,
                      boxShadow: 'var(--ds-card-shadow)',
                    }}
                  >
                    {/* Thumbnail with episode number badge */}
                    <div style={{
                      position: 'relative', width: 168, aspectRatio: '16/9', flexShrink: 0,
                      borderRadius: 'var(--ds-radius-sm)', overflow: 'hidden',
                      background: 'linear-gradient(160deg, var(--ds-surface-2), var(--ds-surface))',
                    }}>
                      {thumb ? (
                        <img src={thumb} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, color: 'var(--ds-text-3)' }}>
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
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, fontWeight: 400, letterSpacing: '0.02em', color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {ep.title}
                        </h3>
                        {ep.duration && <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{ep.duration}</span>}
                      </div>
                      {ep.synopsis && (
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                          {ep.synopsis}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onPlayEpisode(ep)}
                      disabled={!playable}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8, flexShrink: 0,
                        minHeight: 44, padding: '0 22px', borderRadius: 'var(--ds-radius-pill)', cursor: playable ? 'pointer' : 'not-allowed',
                        background: playable ? 'var(--ds-brand)' : 'var(--ds-chip-bg)',
                        border: 'none', color: playable ? '#fff' : 'var(--ds-chip-fg)',
                        boxShadow: playable ? 'var(--ds-shadow-glow-brand)' : 'none',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                        transition: 'all 0.2s',
                      }}
                    >
                      <IconPlay size={14} color={playable ? '#fff' : 'var(--ds-chip-fg)'} /> {playable ? 'Play' : 'Soon'}
                    </button>
                  </div>
                )
              })}
              {!current?.episodes?.length && (
                <div style={{ padding: '40px 4px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-muted)' }}>
                  No episodes published yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
