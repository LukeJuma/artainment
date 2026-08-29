import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, Pencil, Star, Film as FilmIcon,
  X, Loader2, Play, ImagePlus, UserPlus,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { filmsAPI, adminAPI, type Film, type FilmCast } from '../../lib/api'
import { FileUpload } from '../components/FileUpload'

const genres = ['All', 'Drama', 'Thriller', 'Documentary', 'Action', 'Comedy', 'Romance', 'Sci-Fi', 'Horror', 'Adventure']
const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  completed: { label: 'Published', bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  in_production: { label: 'In Production', bg: 'var(--admin-info-glow)', color: 'var(--admin-info)' },
  upcoming: { label: 'Scheduled', bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
}

interface CastMemberItem { name: string; image_url: string }

interface MovieForm {
  title: string
  genre: string
  year: string
  release_date: string
  duration: string
  synopsis: string
  rating: string
  poster_url: string
  video_url: string
  full_video_url: string
  youtube_url: string
  backdrop_url: string
  tag: string
  status: 'completed' | 'in_production' | 'upcoming'
  featured: boolean
  director: string
  producer: string
  castMembers: CastMemberItem[]
}

const emptyForm: MovieForm = {
  title: '', genre: 'Drama', year: new Date().getFullYear().toString(),
  release_date: '', duration: '', synopsis: '', rating: '0', poster_url: '',
  video_url: '', full_video_url: '', youtube_url: '', backdrop_url: '', tag: '', status: 'draft' as any,
  featured: false, director: '', producer: '', castMembers: [],
}

const castToForm = (cast?: FilmCast | null): { director: string; producer: string; castMembers: CastMemberItem[] } => ({
  director: cast?.director || '',
  producer: cast?.producer || '',
  castMembers: (cast?.cast || []).map(m =>
    typeof m === 'string' ? { name: m, image_url: '' } : { name: m.name, image_url: m.image_url || '' }
  ),
})

export function MoviesPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingFilm, setEditingFilm] = useState<Film | null>(null)
  const [form, setForm] = useState<MovieForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [uploading, setUploading] = useState(0)

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
      release_date: film.release_date || '',
      duration: film.duration || '',
      synopsis: film.synopsis || '',
      rating: String(film.rating || 0),
      poster_url: film.poster_url || '',
      video_url: film.video_url || '',
      full_video_url: film.full_video_url || '',
      youtube_url: film.youtube_url || '',
      backdrop_url: film.backdrop_url || '',
      tag: film.tag || '',
      status: film.status,
      featured: film.featured,
      ...castToForm(film.cast),
    })
    setFormError('')
    setShowModal(true)
  }, [])

  const handleSubmit = async () => {
    if (uploading > 0) { setFormError('Please wait for the cast image upload to finish before saving.'); return }
    if (!form.title.trim()) { setFormError('Title is required.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const payload: Record<string, any> = {
        title: form.title.trim(),
        genre: form.genre,
        year: form.year,
        release_date: form.release_date || null,
        duration: form.duration.trim() || null,
        synopsis: form.synopsis.trim() || null,
        rating: Number(form.rating) || 0,
        poster_url: form.poster_url || null,
        video_url: form.video_url || null,
        full_video_url: form.full_video_url || null,
        youtube_url: form.youtube_url.trim() || null,
        backdrop_url: form.backdrop_url || null,
        tag: form.tag || null,
        status: form.status,
        featured: form.featured,
        cast: {
          director: form.director.trim() || null,
          producer: form.producer.trim() || null,
          cast: form.castMembers
            .map(m => ({ name: m.name.trim(), image_url: (m.image_url || '').trim() }))
            .filter(m => m.name)
            .map(m => m.image_url ? m : { name: m.name }),
        },
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
                      {form.genre && !genres.includes(form.genre) && <option value={form.genre}>{form.genre}</option>}
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

                {/* Year + Release Date + Duration + Rating */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Year</label>
                    <input className="admin-input" placeholder="2026" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Release Date</label>
                    <input className="admin-input" type="date" value={form.release_date} onChange={e => setForm({ ...form, release_date: e.target.value })} />
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

                {/* Cast & Crew */}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Cast & Crew</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                    <div>
                      <label className="admin-label">Director</label>
                      <input className="admin-input" placeholder="e.g. Wilson Osiolo" value={form.director} onChange={e => setForm({ ...form, director: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Producer</label>
                      <input className="admin-input" placeholder="e.g. Augustine Ngigi" value={form.producer} onChange={e => setForm({ ...form, producer: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Cast Members</label>
                    {form.castMembers.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 8 }}>No cast members yet. Add the performers of the film.</div>
                    )}
                    {form.castMembers.map((m, i) => (
                      <CastMemberEditor
                        key={i}
                        member={m}
                        token={token}
                        onChange={next => setForm({ ...form, castMembers: form.castMembers.map((x, j) => j === i ? next : x) })}
                        onRemove={() => setForm({ ...form, castMembers: form.castMembers.filter((_, j) => j !== i) })}
                        onUploadingChange={delta => setUploading(u => Math.max(0, u + delta))}
                      />
                    ))}
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setForm({ ...form, castMembers: [...form.castMembers, { name: '', image_url: '' }] })}>
                      <UserPlus size={14} /> Add Cast Member
                    </button>
                  </div>
                </div>

                {/* Poster Upload */}
                <div style={{ marginBottom: 16 }}>
                  <FileUpload label="Poster Image" value={form.poster_url} onChange={url => setForm({ ...form, poster_url: url })} folder="movies/posters" type="image" />
                </div>

                {/* Trailer Upload */}
                <div style={{ marginBottom: 16 }}>
                  <FileUpload label="Trailer Video" value={form.video_url} onChange={url => setForm({ ...form, video_url: url })} folder="movies/trailers" type="video" />
                </div>

                {/* Full Film Upload */}
                <div style={{ marginBottom: 16 }}>
                  <FileUpload label="Full Film Video" value={form.full_video_url} onChange={url => setForm({ ...form, full_video_url: url })} folder="movies/full" type="video" />
                </div>

                {/* YouTube link — plays directly without uploading */}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">YouTube Link (optional)</label>
                  <input
                    className="admin-input"
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    value={form.youtube_url}
                    onChange={e => setForm({ ...form, youtube_url: e.target.value })}
                  />
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 6 }}>
                    Paste a YouTube link for the full film to play directly on the site — no upload needed. Used when "Full Film Video" is empty.
                  </div>
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
                <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={formLoading || uploading > 0}>
                  {uploading > 0 ? 'Uploading image...' : formLoading ? 'Saving...' : editingFilm ? 'Update Movie' : 'Add Movie'}
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

function CastMemberEditor({ member, onChange, onRemove, onUploadingChange, token }: {
  member: CastMemberItem
  onChange: (m: CastMemberItem) => void
  onRemove: () => void
  onUploadingChange: (delta: number) => void
  token: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFile = async (file: File) => {
    if (!token) return
    setUploading(true)
    setUploadError('')
    onUploadingChange(1)
    try {
      const res = await adminAPI.upload(token, file, 'movies/cast')
      onChange({ ...member, image_url: res.url })
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      onUploadingChange(-1)
    }
  }

  const initials = member.name.trim().split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('')

  return (
    <div style={{ padding: 10, border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', marginBottom: 8, background: 'var(--admin-bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 46, height: 46, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--admin-secondary)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {member.image_url ? (
            <img src={member.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text-muted)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{initials || '?'}</span>
          )}
        </div>
        <input
          className="admin-input"
          style={{ flex: 1, minWidth: 0 }}
          placeholder="Name"
          value={member.name}
          onChange={e => onChange({ ...member, name: e.target.value })}
        />
        <button className="admin-btn admin-btn-ghost admin-btn-sm" title="Upload photo" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={14} />}
        </button>
        <button className="admin-btn admin-btn-danger admin-btn-sm" title="Remove member" onClick={onRemove}><Trash2 size={13} /></button>
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          className="admin-input"
          style={{ fontSize: 12 }}
          placeholder="Or paste image URL"
          value={member.image_url || ''}
          onChange={e => onChange({ ...member, image_url: e.target.value })}
        />
      </div>
      {uploadError && <div style={{ fontSize: 11, color: 'var(--admin-danger)', marginTop: 6 }}>{uploadError}</div>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
          if (inputRef.current) inputRef.current.value = ''
        }}
      />
    </div>
  )
}
