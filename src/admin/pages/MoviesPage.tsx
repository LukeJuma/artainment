import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, Pencil, Star, Film as FilmIcon,
  X, Loader2, Play, Image,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { filmsAPI, adminAPI, type Film } from '../../lib/api'
import { FileUpload } from '../components/FileUpload'

const genres = ['All', 'Drama', 'Thriller', 'Documentary', 'Action', 'Comedy', 'Romance', 'Sci-Fi', 'Horror', 'Adventure']
const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  completed: { label: 'Published', bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  in_production: { label: 'In Production', bg: 'var(--admin-info-glow)', color: 'var(--admin-info)' },
  upcoming: { label: 'Scheduled', bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
}

interface MovieForm {
  title: string
  genre: string
  year: string
  duration: string
  synopsis: string
  rating: string
  poster_url: string
  video_url: string
  backdrop_url: string
  tag: string
  status: 'completed' | 'in_production' | 'upcoming'
  featured: boolean
}

const emptyForm: MovieForm = {
  title: '', genre: 'Drama', year: new Date().getFullYear().toString(),
  duration: '', synopsis: '', rating: '0', poster_url: '',
  video_url: '', backdrop_url: '', tag: '', status: 'draft' as any,
  featured: false,
}

export function MoviesPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingFilm, setEditingFilm] = useState<Film | null>(null)
  const [form, setForm] = useState<MovieForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: films, loading, refetch } = useApi(() => filmsAPI.list(), [])

  const filtered = (films || []).filter(f => {
    const matchSearch = !search || f.title.toLowerCase().includes(search.toLowerCase()) || f.genre.toLowerCase().includes(search.toLowerCase())
    const matchGenre = selectedGenre === 'All' || f.genre === selectedGenre
    return matchSearch && matchGenre
  })

  const openCreate = useCallback(() => {
    setEditingFilm(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }, [])

  const openEdit = useCallback((film: Film) => {
    setEditingFilm(film)
    setForm({
      title: film.title,
      genre: film.genre,
      year: film.year,
      duration: film.duration || '',
      synopsis: film.synopsis || '',
      rating: String(film.rating || 0),
      poster_url: film.poster_url || '',
      video_url: film.video_url || '',
      backdrop_url: film.backdrop_url || '',
      tag: film.tag || '',
      status: film.status,
      featured: film.featured,
    })
    setFormError('')
    setShowModal(true)
  }, [])

  const handleSubmit = async () => {
    if (!form.title.trim()) { setFormError('Title is required.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const payload: Record<string, any> = {
        title: form.title.trim(),
        genre: form.genre,
        year: form.year,
        duration: form.duration.trim() || null,
        synopsis: form.synopsis.trim() || null,
        rating: Number(form.rating) || 0,
        poster_url: form.poster_url || null,
        video_url: form.video_url || null,
        backdrop_url: form.backdrop_url || null,
        tag: form.tag || null,
        status: form.status,
        featured: form.featured,
      }
      if (editingFilm) {
        await adminAPI.updateFilm(token!, editingFilm.id, payload)
      } else {
        await adminAPI.createFilm(token!, payload)
      }
      setShowModal(false)
      refetch()
    } catch (e: any) {
      setFormError(e.message || 'Failed to save movie.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this movie? This cannot be undone.')) return
    try { await adminAPI.deleteFilm(token, id); refetch() } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Movies"
        description={`${films?.length || 0} total movies in your library`}
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Movie
          </button>
        }
      />

      {/* Filters */}
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search movies..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <div className="admin-filter-group">
          {genres.slice(0, 7).map(g => (
            <button key={g} className={`admin-btn ${selectedGenre === g ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-sm`} onClick={() => setSelectedGenre(g)} style={{ fontSize: 12 }}>{g}</button>
          ))}
        </div>
      </div>

      {/* Movie List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <FilmIcon size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
          <h3>No movies found</h3>
          <p>Add your first movie to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {filtered.map((film, idx) => {
            const st = statusMap[film.status] || statusMap.upcoming
            return (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="admin-card"
                style={{ padding: 0, overflow: 'hidden', cursor: 'default' }}
              >
                {/* Poster */}
                <div style={{ height: 200, position: 'relative', background: 'var(--admin-secondary)' }}>
                  {film.poster_url ? (
                    <img src={film.poster_url} alt={film.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FilmIcon size={36} style={{ color: 'var(--admin-text-faint)' }} />
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 8, right: 8 }}>
                    <span className="badge" style={{ background: st.bg, color: st.color, fontSize: 10 }}>{st.label}</span>
                  </div>
                  {film.video_url && (
                    <div style={{ position: 'absolute', bottom: 8, left: 8, width: 28, height: 28, borderRadius: 8, background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Play size={12} fill="#fff" style={{ color: '#fff', marginLeft: 1 }} />
                    </div>
                  )}
                </div>
                {/* Info */}
                <div style={{ padding: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 4, fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {film.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 10 }}>
                    <span>{film.genre}</span>
                    <span>·</span>
                    <span>{film.year}</span>
                    {film.duration && <><span>·</span><span>{film.duration}</span></>}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
                      <Star size={10} style={{ color: 'var(--admin-accent)', fill: 'var(--admin-accent)' }} />
                      {film.rating}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ flex: 1 }} onClick={() => openEdit(film)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(film.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 680 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingFilm ? 'Edit Movie' : 'Add New Movie'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>
                    {formError}
                  </div>
                )}

                {/* Title */}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Movie Title *</label>
                  <input className="admin-input" placeholder="Enter movie title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>

                {/* Genre + Status */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Genre</label>
                    <select className="admin-select" style={{ width: '100%' }} value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })}>
                      {genres.filter(g => g !== 'All').map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Status</label>
                    <select className="admin-select" style={{ width: '100%' }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                      <option value="completed">Published</option>
                      <option value="in_production">In Production</option>
                      <option value="upcoming">Scheduled</option>
                    </select>
                  </div>
                </div>

                {/* Year + Duration + Rating */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Year</label>
                    <input className="admin-input" placeholder="2026" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Duration</label>
                    <input className="admin-input" placeholder="e.g. 2h 14m" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Rating (0-10)</label>
                    <input className="admin-input" type="number" min="0" max="10" step="0.1" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
                  </div>
                </div>

                {/* Synopsis */}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Synopsis</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Movie synopsis..." value={form.synopsis} onChange={e => setForm({ ...form, synopsis: e.target.value })} />
                </div>

                {/* Poster Upload */}
                <div style={{ marginBottom: 16 }}>
                  <FileUpload label="Poster Image" value={form.poster_url} onChange={url => setForm({ ...form, poster_url: url })} folder="movies/posters" type="image" />
                </div>

                {/* Trailer Upload */}
                <div style={{ marginBottom: 16 }}>
                  <FileUpload label="Trailer Video" value={form.video_url} onChange={url => setForm({ ...form, video_url: url })} folder="movies/trailers" type="video" />
                </div>

                {/* Tag */}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Tag</label>
                  <input className="admin-input" placeholder="e.g. Featured, New Release" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} />
                </div>

                {/* Featured */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                  <input type="checkbox" className="admin-checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  Featured on homepage
                </label>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingFilm ? 'Update Movie' : 'Add Movie'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--admin-text-muted)' }}>
        Showing {filtered.length} of {films?.length || 0} movies
      </div>
    </div>
  )
}
