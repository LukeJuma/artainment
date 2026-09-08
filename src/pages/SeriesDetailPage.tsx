import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { seriesAPI, videoStreamUrl, type Episode, type Series } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { VideoModal } from '../components/ui/VideoModal'
import { SeriesDetailHero } from '../components/series/SeriesDetailHero'
import { EpisodeList } from '../components/series/EpisodeList'

export function SeriesDetailPage() {
  const { slug } = useParams()
  const [series, setSeries] = useState<Series | null>(null)
  const [error, setError] = useState(false)
  const [playing, setPlaying] = useState<Episode | null>(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const [useCustomPlayer, setUseCustomPlayer] = useState(true) // Default to Enhanced Player for better experience

  useEffect(() => {
    if (!slug) return
    let alive = true
    setError(false)
    setSeries(null)
    setPlaying(null)
    setShowTrailer(false)
    seriesAPI.get(slug)
      .then(s => { if (alive) setSeries(s) })
      .catch(() => { if (alive) setError(true) })
    return () => { alive = false }
  }, [slug])

  if (error) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Chonburi, cursive', fontSize: 24, color: 'var(--text)', marginBottom: 24 }}>Series not found.</p>
        <Link to="/series" className="btn-outline">Browse Series</Link>
      </div>
    )
  }

  if (!series) return <Loader />

  const firstPlayable = series.seasons?.flatMap(s => s.episodes || []).find(e => e.video_url) || null

  return (
    <div style={{ paddingTop: 0 }}>
      <SeriesDetailHero
        series={series}
        startable={Boolean(firstPlayable)}
        onStart={() => firstPlayable && setPlaying(firstPlayable)}
        onPlayTrailer={() => setShowTrailer(true)}
      />

      {/* Player Preference Toggle */}
      {(Boolean(firstPlayable) || Boolean(series.video_url)) && (
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)',
            }}>
              💡 Enhanced player replaces YouTube controls with a custom cinematic UI
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)',
            }}>
              Player:
            </span>
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
            }}>
              <button
                onClick={() => setUseCustomPlayer(false)}
                style={{
                  padding: '8px 16px', background: !useCustomPlayer ? 'var(--red)' : 'transparent',
                  border: 'none', color: !useCustomPlayer ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Standard
              </button>
              <button
                onClick={() => setUseCustomPlayer(true)}
                style={{
                  padding: '8px 16px', background: useCustomPlayer ? 'var(--red)' : 'transparent',
                  border: 'none', color: useCustomPlayer ? '#fff' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s ease',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Enhanced
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showTrailer && series.video_url && (
          <VideoModal
            src={videoStreamUrl(series.video_url)!}
            title={`${series.title} trailer`}
            poster={series.backdrop_url || series.poster_url}
            onClose={() => setShowTrailer(false)}
            useCustomPlayer={useCustomPlayer}
          />
        )}
        {playing && playing.video_url && (
          <VideoModal
            src={videoStreamUrl(playing.video_url)!}
            title={`${series.title} — Episode ${playing.episode_number}: ${playing.title}`}
            poster={series.backdrop_url || series.poster_url}
            onClose={() => setPlaying(null)}
            useCustomPlayer={useCustomPlayer}
          />
        )}
      </AnimatePresence>

      <EpisodeList series={series} onPlayEpisode={setPlaying} />
    </div>
  )
}
