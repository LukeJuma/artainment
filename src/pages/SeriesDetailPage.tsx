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

  useEffect(() => {
    if (!slug) return
    let alive = true
    setError(false)
    setSeries(null)
    setPlaying(null)
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
      />

      <AnimatePresence>
        {playing && playing.video_url && (
          <VideoModal
            src={videoStreamUrl(playing.video_url)!}
            title={`${series.title} — Episode ${playing.episode_number}: ${playing.title}`}
            poster={series.backdrop_url || series.poster_url}
            onClose={() => setPlaying(null)}
          />
        )}
      </AnimatePresence>

      <EpisodeList series={series} onPlayEpisode={setPlaying} />
    </div>
  )
}
