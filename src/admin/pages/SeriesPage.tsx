import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Trash2, Pencil, Star, Tv, X, Loader2, Play,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { seriesAPI, adminAPI, type Series, type Season, type Episode } from '../../lib/api'
import { FileUpload } from '../components/FileUpload'

const genres = ['Drama', 'Crime Drama', 'Thriller', 'Documentary', 'Music', 'Romance', 'Sci-Fi', 'Comedy']
const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  completed: { label: 'Published', bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  in_production: { label: 'In Production', bg: 'var(--admin-info-glow)', color: 'var(--admin-info)' },
  upcoming: { label: 'Scheduled', bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
}

interface SeriesForm {
  title: string
  genre: string
  year: string
  synopsis: string
  rating: string
  poster_url: string
  backdrop_url: string
  tag: string
  status: 'completed' | 'in_production' | 'upcoming'
  featured: boolean
}

const emptySeriesForm: SeriesForm = {
  title: '', genre: 'Drama', year: new Date().getFullYear().toString(),
  synopsis: '', rating: '0', poster_url: '', backdrop_url: '', tag: '',
  status: 'completed', featured: false,
}

interface SeasonForm {
  season_number: string
  title: string
  synopsis: string
}

const emptySeasonForm: SeasonForm = { season_number: '1', title: '', synopsis: '' }

interface EpisodeForm {
  episode_number: string
  title: string
  synopsis: string
  duration: string
  video_url: string
  poster_url: string
}

const emptyEpisodeForm: EpisodeForm = {
  episode_number: '1', title: '', synopsis: '', duration: '', video_url: '', poster_url: '',
}

export function SeriesPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [showSeriesModal, setShowSeriesModal] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [seriesForm, setSeriesForm] = useState<SeriesForm>(emptySeriesForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loadingSeasons, setLoadingSeasons] = useState(false)

  const [showSeasonModal, setShowSeasonModal] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [seasonForm, setSeasonForm] = useState<SeasonForm>(emptySeasonForm)
  const [seasonError, setSeasonError] = useState('')

  const [showEpisodeModal, setShowEpisodeModal] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null)
  const [episodeSeasonId, setEpisodeSeasonId] = useState<number | null>(null)
  const [episodeForm, setEpisodeForm] = useState<EpisodeForm>(emptyEpisodeForm)
  const [episodeError, setEpisodeError] = useState('')

  const { data: series, loading, refetch } = useApi(() => seriesAPI.list(), [])

  const filtered = (series || []).filter(s => s.title.toLowerCase().includes(search.toLowerCase()))

  const loadSeasons = useCallback(async (seriesId: number) => {
    if (!token) return
    setLoadingSeasons(true)
    try {
      const list = await adminAPI.seriesSeasons(token, seriesId)
      const withEps = await Promise.all(list.map(async s => ({
        ...s,
        episodes: await adminAPI.seasonEpisodes(token, s.id),
      })))
      setSeasons(withEps)
    } catch { setSeasons([]) } finally { setLoadingSeasons(false) }
  }, [token])

  const toggleExpand = useCallback((seriesId: number) => {
    if (expandedId === seriesId) { setExpandedId(null); setSeasons([]); return }
    setExpandedId(seriesId)
    loadSeasons(seriesId)
  }, [expandedId, loadSeasons])

  // ─── Series ──────────────────────────────────────────────────
  const openCreateSeries = () => {
    setEditingSeries(null)
    setSeriesForm(emptySeriesForm)
    setFormError('')
    setShowSeriesModal(true)
  }

  const openEditSeries = (s: Series) => {
    setEditingSeries(s)
    setSeriesForm({
      title: s.title,
      genre: s.genre,
      year: s.year,
      synopsis: s.synopsis || '',
      rating: String(s.rating || 0),
      poster_url: s.poster_url || '',
      backdrop_url: s.backdrop_url || '',
      tag: s.tag || '',
      status: s.status,
      featured: s.featured,
    })
    setFormError('')
    setShowSeriesModal(true)
  }

  const handleSubmitSeries = async () => {
    if (!seriesForm.title.trim()) { setFormError('Title is required.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const payload: Record<string, any> = {
        title: seriesForm.title.trim(),
        genre: seriesForm.genre,
        year: seriesForm.year,
        synopsis: seriesForm.synopsis.trim() || null,
        rating: Number(seriesForm.rating) || 0,
        poster_url: seriesForm.poster_url || null,
        backdrop_url: seriesForm.backdrop_url || null,
        tag: seriesForm.tag || null,
        status: seriesForm.status,
        featured: seriesForm.featured,
      }
      if (editingSeries) {
        await adminAPI.updateSeries(token!, editingSeries.id, payload)
      } else {
        await adminAPI.createSeries(token!, payload)
      }
      setShowSeriesModal(false)
      refetch()
    } catch (e: any) {
      setFormError(e.message || 'Failed to save series.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSeries = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this series and all of its seasons and episodes? This cannot be undone.')) return
    try {
      await adminAPI.deleteSeries(token, id)
      if (expandedId === id) { setExpandedId(null); setSeasons([]) }
      refetch()
    } catch {}
  }

  // ─── Seasons ─────────────────────────────────────────────────
  const openCreateSeason = () => {
    setEditingSeason(null)
    setSeasonForm(emptySeasonForm)
    setSeasonError('')
    setShowSeasonModal(true)
  }

  const openEditSeason = (s: Season) => {
    setEditingSeason(s)
    setSeasonForm({ season_number: String(s.season_number), title: s.title || '', synopsis: s.synopsis || '' })
    setSeasonError('')
    setShowSeasonModal(true)
  }

  const handleSubmitSeason = async () => {
    if (!expandedId) return
    setSeasonError('')
    try {
      const payload = { season_number: Number(seasonForm.season_number) || 1, title: seasonForm.title.trim() || null, synopsis: seasonForm.synopsis.trim() || null }
      if (editingSeason) {
        await adminAPI.updateSeason(token!, editingSeason.id, payload)
      } else {
        await adminAPI.createSeason(token!, expandedId, payload)
      }
      setShowSeasonModal(false)
      loadSeasons(expandedId)
    } catch (e: any) {
      setSeasonError(e.message || 'Failed to save season.')
    }
  }

  const handleDeleteSeason = async (id: number) => {
    if (!token || !expandedId) return
    if (!confirm('Delete this season and its episodes?')) return
    try { await adminAPI.deleteSeason(token, id); loadSeasons(expandedId) } catch {}
  }

  // ─── Episodes ────────────────────────────────────────────────
  const openCreateEpisode = (seasonId: number) => {
    setEditingEpisode(null)
    setEpisodeSeasonId(seasonId)
    setEpisodeForm(emptyEpisodeForm)
    setEpisodeError('')
    setShowEpisodeModal(true)
  }

  const openEditEpisode = (ep: Episode) => {
    setEditingEpisode(ep)
    setEpisodeSeasonId(ep.season_id)
    setEpisodeForm({
      episode_number: String(ep.episode_number),
      title: ep.title,
      synopsis: ep.synopsis || '',
      duration: ep.duration || '',
      video_url: ep.video_url || '',
      poster_url: ep.poster_url || '',
    })
    setEpisodeError('')
    setShowEpisodeModal(true)
  }

  const handleSubmitEpisode = async () => {
    if (!episodeSeasonId) return
    if (!episodeForm.title.trim()) { setEpisodeError('Episode title is required.'); return }
    setEpisodeError('')
    try {
      const payload = {
        episode_number: Number(episodeForm.episode_number) || 1,
        title: episodeForm.title.trim(),
        synopsis: episodeForm.synopsis.trim() || null,
        duration: episodeForm.duration.trim() || null,
        video_url: episodeForm.video_url || null,
        poster_url: episodeForm.poster_url || null,
      }
      if (editingEpisode) {
        await adminAPI.updateEpisode(token!, editingEpisode.id, payload)
      } else {
        await adminAPI.createEpisode(token!, episodeSeasonId, payload)
      }
      setShowEpisodeModal(false)
      if (expandedId) loadSeasons(expandedId)
      refetch()
    } catch (e: any) {
      setEpisodeError(e.message || 'Failed to save episode.')
    }
  }

  const handleDeleteEpisode = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this episode?')) return
    try {
      await adminAPI.deleteEpisode(token, id)
      if (expandedId) loadSeasons(expandedId)
      refetch()
    } catch {}
  }

  return (
    <div>
      <PageHeader
        title="TV Series"
        description={`${series?.length || 0} series in your library`}
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreateSeries}>
            <Plus size={15} /> Add Series
          </button>
        }
      />

      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search series..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <Tv size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
          <h3>No series found</h3>
          <p>Add your first series to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((s, idx) => {
            const st = statusMap[s.status] || statusMap.upcoming
            const isOpen = expandedId === s.id
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14 }}>
                  <div style={{ width: 68, height: 92, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--admin-secondary)' }}>
                    {s.poster_url ? (
                      <img src={s.poster_url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Tv size={22} style={{ color: 'var(--admin-text-faint)' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title}</span>
                      <span className="badge" style={{ background: st.bg, color: st.color, fontSize: 10, flexShrink: 0 }}>{st.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 8, flexWrap: 'wrap' }}>
                      <span>{s.genre}</span>
                      <span>·</span>
                      <span>{s.year}</span>
                      <span>·</span>
                      <span>{s.seasons_count || seasons.filter(se => se.series_id === s.id).length || 0} seasons</span>
                      <span>·</span>
                      <span>{s.episodes_count || 0} episodes</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 'auto' }}>
                        <Star size={10} style={{ color: 'var(--admin-accent)', fill: 'var(--admin-accent)' }} />
                        {s.rating}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className={`admin-btn admin-btn-sm ${isOpen ? 'admin-btn-primary' : 'admin-btn-ghost'}`} onClick={() => toggleExpand(s.id)}>
                      {isOpen ? <><ChevronUp size={13} /> Episodes</> : <><ChevronDown size={13} /> Episodes</>}
                    </button>
                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditSeries(s)}>
                      <Pencil size={13} /> Edit
                    </button>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteSeries(s.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Expanded seasons / episodes */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--admin-border)' }}>
                      <div style={{ padding: 18, background: 'var(--admin-bg)' }}>
                        {loadingSeasons ? (
                          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
                            <Loader2 size={24} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
                          </div>
                        ) : seasons.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--admin-text-muted)', fontSize: 13 }}>
                            No seasons yet.
                          </div>
                        ) : (
                          seasons.map(season => (
                            <div key={season.id} className="admin-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderBottom: '1px solid var(--admin-border)' }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                                  {season.title || `Season ${season.season_number}`}
                                </span>
                                <span className="badge" style={{ background: 'var(--admin-info-glow)', color: 'var(--admin-info)', fontSize: 10 }}>{season.episodes?.length || 0} episodes</span>
                                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditSeason(season)}><Pencil size={12} /></button>
                                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteSeason(season.id)}><Trash2 size={12} /></button>
                                </div>
                              </div>
                              {(season.episodes || []).map(ep => (
                                <div key={ep.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderBottom: '1px solid var(--admin-border)' }}>
                                  <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', width: 24, flexShrink: 0, fontWeight: 700 }}>{ep.episode_number}</span>
                                  {ep.video_url && (
                                    <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <Play size={10} fill="#fff" style={{ color: '#fff', marginLeft: 1 }} />
                                    </span>
                                  )}
                                  <span style={{ flex: 1, fontSize: 13, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.title}</span>
                                  {ep.duration && <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', flexShrink: 0 }}>{ep.duration}</span>}
                                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditEpisode(ep)}><Pencil size={12} /></button>
                                    <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteEpisode(ep.id)}><Trash2 size={12} /></button>
                                  </div>
                                </div>
                              ))}
                              <div style={{ padding: 10 }}>
                                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openCreateEpisode(season.id)}>
                                  <Plus size={13} /> Add Episode
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={openCreateSeason}>
                          <Plus size={13} /> Add Season
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ─── Series Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSeriesModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSeriesModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 680 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingSeries ? 'Edit Series' : 'Add New Series'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowSeriesModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>{formError}</div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Series Title *</label>
                  <input className="admin-input" placeholder="Enter series title" value={seriesForm.title} onChange={e => setSeriesForm({ ...seriesForm, title: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Genre</label>
                    <select className="admin-select" style={{ width: '100%' }} value={seriesForm.genre} onChange={e => setSeriesForm({ ...seriesForm, genre: e.target.value })}>
                      {seriesForm.genre && !genres.includes(seriesForm.genre) && <option value={seriesForm.genre}>{seriesForm.genre}</option>}
                      {genres.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Year</label>
                    <input className="admin-input" placeholder="2026" value={seriesForm.year} onChange={e => setSeriesForm({ ...seriesForm, year: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Rating (0-10)</label>
                    <input className="admin-input" type="number" min="0" max="10" step="0.1" value={seriesForm.rating} onChange={e => setSeriesForm({ ...seriesForm, rating: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Synopsis</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Series synopsis..." value={seriesForm.synopsis} onChange={e => setSeriesForm({ ...seriesForm, synopsis: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Poster Image</label>
                    <FileUpload label="Poster" value={seriesForm.poster_url} onChange={url => setSeriesForm({ ...seriesForm, poster_url: url })} folder="series/posters" type="image" />
                  </div>
                  <div>
                    <label className="admin-label">Backdrop Image</label>
                    <FileUpload label="Backdrop" value={seriesForm.backdrop_url} onChange={url => setSeriesForm({ ...seriesForm, backdrop_url: url })} folder="series/backdrops" type="image" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Tag</label>
                    <input className="admin-input" placeholder="e.g. New Series" value={seriesForm.tag} onChange={e => setSeriesForm({ ...seriesForm, tag: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Status</label>
                    <select className="admin-select" style={{ width: '100%' }} value={seriesForm.status} onChange={e => setSeriesForm({ ...seriesForm, status: e.target.value as any })}>
                      <option value="completed">Published</option>
                      <option value="in_production">In Production</option>
                      <option value="upcoming">Scheduled</option>
                    </select>
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                  <input type="checkbox" className="admin-checkbox" checked={seriesForm.featured} onChange={e => setSeriesForm({ ...seriesForm, featured: e.target.checked })} />
                  Featured on homepage
                </label>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowSeriesModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmitSeries} disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingSeries ? 'Update Series' : 'Add Series'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Season Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showSeasonModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSeasonModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 480 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingSeason ? 'Edit Season' : 'Add Season'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowSeasonModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {seasonError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>{seasonError}</div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Season Number *</label>
                  <input className="admin-input" type="number" min="1" value={seasonForm.season_number} onChange={e => setSeasonForm({ ...seasonForm, season_number: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Season Title</label>
                  <input className="admin-input" placeholder="e.g. Kwanza" value={seasonForm.title} onChange={e => setSeasonForm({ ...seasonForm, title: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Season Synopsis</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Season synopsis..." value={seasonForm.synopsis} onChange={e => setSeasonForm({ ...seasonForm, synopsis: e.target.value })} />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowSeasonModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmitSeason}>
                  {editingSeason ? 'Update Season' : 'Add Season'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Episode Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {showEpisodeModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEpisodeModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 640 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingEpisode ? 'Edit Episode' : 'Add Episode'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowEpisodeModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {episodeError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>{episodeError}</div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Episode No *</label>
                    <input className="admin-input" type="number" min="1" value={episodeForm.episode_number} onChange={e => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Episode Title *</label>
                    <input className="admin-input" placeholder="Episode title" value={episodeForm.title} onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Duration</label>
                    <input className="admin-input" placeholder="e.g. 52m" value={episodeForm.duration} onChange={e => setEpisodeForm({ ...episodeForm, duration: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Synopsis</label>
                  <textarea className="admin-textarea" rows={2} placeholder="Episode synopsis..." value={episodeForm.synopsis} onChange={e => setEpisodeForm({ ...episodeForm, synopsis: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FileUpload label="Episode Video" value={episodeForm.video_url} onChange={url => setEpisodeForm({ ...episodeForm, video_url: url })} folder="series/episodes" type="video" />
                </div>
                <div>
                  <FileUpload label="Episode Thumbnail" value={episodeForm.poster_url} onChange={url => setEpisodeForm({ ...episodeForm, poster_url: url })} folder="series/episode-thumbs" type="image" />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowEpisodeModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmitEpisode}>
                  {editingEpisode ? 'Update Episode' : 'Add Episode'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--admin-text-muted)' }}>
        Showing {filtered.length} of {series?.length || 0} series
      </div>
    </div>
  )
}
