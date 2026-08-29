import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Episode, Series } from '../../lib/api'
import { IconPlay } from '../ui/Icons'

interface EpisodeListProps {
  series: Series
  onPlayEpisode: (episode: Episode) => void
}

export function EpisodeList({ series, onPlayEpisode }: EpisodeListProps) {
  const seasons = series.seasons || []
  const [activeSeason, setActiveSeason] = useState<number>(
    seasons.find(s => s.episodes?.some(e => e.video_url))?.season_number ?? seasons[0]?.season_number ?? 1
  )

  const current = seasons.find(s => s.season_number === activeSeason)

  return (
    <section style={{ padding: '72px 0' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
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
                  padding: '10px 22px', minHeight: 40, borderRadius: 6, transition: 'all 0.2s', fontWeight: 600,
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
                return (
                  <div
                    key={ep.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 18, padding: '18px 4px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <span style={{
                      fontFamily: 'Chonburi, cursive', fontSize: 22, color: 'var(--text-muted)',
                      width: 44, flexShrink: 0, textAlign: 'center',
                    }}>
                      {String(ep.episode_number).padStart(2, '0')}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h3 style={{ fontFamily: 'Chonburi, cursive', fontSize: 17, fontWeight: 600, color: 'var(--text)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                        minHeight: 44, padding: '0 20px', borderRadius: 6, cursor: playable ? 'pointer' : 'not-allowed',
                        background: playable ? 'var(--red)' : 'var(--bg-muted)',
                        border: 'none', color: playable ? 'var(--text)' : 'var(--text-muted)',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                        transition: 'all 0.2s',
                      }}
                    >
                      <IconPlay size={14} color={playable ? 'var(--text)' : 'var(--text-muted)'} /> {playable ? 'Play' : 'Soon'}
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
