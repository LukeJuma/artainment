import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { filmsAPI, videoStreamUrl, fullFilmStreamUrl, type Film } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { VideoModal } from '../components/ui/VideoModal'
import { FilmDetailHero } from '../components/film/FilmDetailHero'
import { FilmCastCrew } from '../components/film/FilmCastCrew'
import { FilmDescription } from '../components/film/FilmDescription'
import { FilmRelated } from '../components/film/FilmRelated'
import { useAuth } from '../contexts/AuthContext'

export function FilmDetailPage() {
  const { slug } = useParams()
  const { token } = useAuth()
  const [film, setFilm] = useState<Film | null>(null)
  const [related, setRelated] = useState<Film[]>([])
  const [error, setError] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    if (!slug) return
    let alive = true
    setError(false)
    setFilm(null)
    setRelated([])
    setShowTrailer(false)
    setShowFull(false)

    filmsAPI.get(slug)
      .then(async f => {
        if (!alive) return
        setFilm(f)
        try {
          const all = await filmsAPI.list()
          if (!alive) return
          const others = all.filter(x => x.id !== f.id)
          const sameGenre = others.filter(x => x.genre === f.genre)
          const rest = others.filter(x => x.genre !== f.genre)
          setRelated([...sameGenre, ...rest].slice(0, 6))
        } catch {
          /* related films are optional */
        }
      })
      .catch(() => { if (alive) setError(true) })

    return () => { alive = false }
  }, [slug])

  if (error) {
    return (
      <div style={{ paddingTop: 120, textAlign: 'center' }}>
        <p style={{ fontFamily: 'Chonburi, cursive', fontSize: 24, color: 'var(--text)', marginBottom: 24 }}>Film not found.</p>
        <Link to="/films" className="btn-outline">Browse Movies</Link>
      </div>
    )
  }

  if (!film) return <Loader />

  return (
    <div style={{ paddingTop: 0 }}>
      <FilmDetailHero
        film={film}
        onPlayTrailer={() => setShowTrailer(true)}
        onPlayFull={() => setShowFull(true)}
      />

      <AnimatePresence>
        {showTrailer && film.video_url && (
          <VideoModal
            src={videoStreamUrl(film.video_url)!}
            title={`${film.title} trailer`}
            poster={film.backdrop_url || film.poster_url}
            onClose={() => setShowTrailer(false)}
          />
        )}
        {showFull && film.has_full_video && (
          <VideoModal
            src={film.youtube_url || fullFilmStreamUrl(film.slug)}
            title={film.title}
            poster={film.backdrop_url || film.poster_url}
            authToken={film.youtube_url ? null : token}
            onClose={() => setShowFull(false)}
          />
        )}
      </AnimatePresence>

      <FilmCastCrew film={film} />
      <FilmDescription film={film} />
      <FilmRelated films={related} />
    </div>
  )
}
