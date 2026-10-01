import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Podcast, Search, Plus, Trash2, Pencil, X, Loader2, ImagePlus, Mic, ListMusic, ChevronDown, Save } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { podcastAPI, adminAPI, type Podcast as PodcastModel, type PodcastEpisode } from '../../lib/api'

interface PodcastForm {
  title: string
  host: string
  category: string
  description: string
  cover_url: string
  sort_order: string
  active: boolean
}

const emptyForm: PodcastForm = {
  title: '', host: '', category: '', description: '', cover_url: '', sort_order: '0', active: true,
}

interface EpisodeForm {
  episode_number: string
  title: string
  description: string
  duration: string
  audio_url: string
  video_url: string
  published_at: string
}

const emptyEpisode: EpisodeForm = {
  episode_number: '1', title: '', description: '', duration: '', audio_url: '', video_url: '', published_at: '',
}

export function PodcastsPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [showPodcastModal, setShowPodcastModal] = useState(false)
  const [editingPodcast, setEditingPodcast] = useState<PodcastModel | null>(null)
  const [podcastForm, setPodcastForm] = useState<PodcastForm>(emptyForm)
  const [podcastSaving, setPodcastSaving] = useState(false)
  const [podcastError, setPodcastError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([])
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [showEpisodeModal, setShowEpisodeModal] = useState(false)
  const [editingEpisode, setEditingEpisode] = useState<PodcastEpisode | null>(null)
  const [episodeForm, setEpisodeForm] = useState<EpisodeForm>(emptyEpisode)
  const [episodeSaving, setEpisodeSaving] = useState(false)
  const [episodeError, setEpisodeError] = useState('')

  const { data: podcasts, loading, refetch } = useApi(() => podcastAPI.list(), [])

  const filtered = (podcasts || []).filter(p =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.host || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreatePodcast = useCallback(() => {
    setEditingPodcast(null)
    setPodcastForm(emptyForm)
    setPodcastError('')
    setShowPodcastModal(true)
  }, [])

  const openEditPodcast = useCallback((p: PodcastModel) => {
    setEditingPodcast(p)
    setPodcastForm({
      title: p.title,
      host: p.host || '',
      category: p.category || '',
      description: p.description || '',
      cover_url: p.cover_url || '',
      sort_order: String(p.sort_order || 0),
      active: p.active,
    })
    setPodcastError('')
    setShowPodcastModal(true)
  }, [])

  const handleSavePodcast = async () => {
    if (!podcastForm.title.trim()) { setPodcastError('Title is required.'); return }
    setPodcastSaving(true)
    setPodcastError('')
    try {
      const payload = {
        title: podcastForm.title.trim(),
        host: podcastForm.host.trim() || null,
        category: podcastForm.category.trim() || null,
        description: podcastForm.description.trim() || null,
        cover_url: podcastForm.cover_url || null,
        sort_order: Number(podcastForm.sort_order) || 0,
        active: podcastForm.active,
      }
      if (editingPodcast) {
        await adminAPI.updatePodcast(token!, editingPodcast.id, payload)
      } else {
        await adminAPI.createPodcast(token!, payload)
      }
      setShowPodcastModal(false)
      refetch()
    } catch (e: any) {
      setPodcastError(e.message || 'Failed to save podcast.')
    } finally {
      setPodcastSaving(false)
    }
  }

  const handleDeletePodcast = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this podcast and all its episodes? This cannot be undone.')) return
    try { await adminAPI.deletePodcast(token, id); refetch() } catch {}
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    setEpisodesLoading(true)
    setEpisodes([])
    try {
      const eps = await adminAPI.podcastEpisodes(token!, id)
      setEpisodes(eps || [])
    } catch {
      setEpisodes([])
    } finally {
      setEpisodesLoading(false)
    }
  }

  const openCreateEpisode = () => {
    const nextNum = episodes.length ? Math.max(...episodes.map(e => e.episode_number || 0)) + 1 : 1
    setEditingEpisode(null)
    setEpisodeForm({ ...emptyEpisode, episode_number: String(nextNum) })
    setEpisodeError('')
    setShowEpisodeModal(true)
  }

  const openEditEpisode = (ep: PodcastEpisode) => {
    setEditingEpisode(ep)
    setEpisodeForm({
      episode_number: String(ep.episode_number || 0),
      title: ep.title,
      description: ep.description || '',
      duration: ep.duration || '',
      audio_url: ep.audio_url || '',
      video_url: ep.video_url || '',
      published_at: ep.published_at ? ep.published_at.slice(0, 10) : '',
    })
    setEpisodeError('')
    setShowEpisodeModal(true)
  }

  const handleSaveEpisode = async () => {
    if (!expandedId) return
    if (!episodeForm.title.trim()) { setEpisodeError('Episode title is required.'); return }
    setEpisodeSaving(true)
    setEpisodeError('')
    try {
      const payload = {
        episode_number: Number(episodeForm.episode_number) || 1,
        title: episodeForm.title.trim(),
        description: episodeForm.description.trim() || null,
        duration: episodeForm.duration.trim() || null,
        audio_url: episodeForm.audio_url.trim() || null,
        video_url: episodeForm.video_url.trim() || null,
        published_at: episodeForm.published_at || null,
      }
      if (editingEpisode) {
        await adminAPI.updatePodcastEpisode(token!, editingEpisode.id, payload)
      } else {
        await adminAPI.createPodcastEpisode(token!, expandedId, payload)
      }
      setShowEpisodeModal(false)
      const eps = await adminAPI.podcastEpisodes(token!, expandedId)
      setEpisodes(eps || [])
      refetch()
    } catch (e: any) {
      setEpisodeError(e.message || 'Failed to save episode.')
    } finally {
      setEpisodeSaving(false)
    }
  }

  const handleDeleteEpisode = async (ep: PodcastEpisode) => {
    if (!token) return
    if (!confirm(`Delete episode "${ep.title}"?`)) return
    try {
      await adminAPI.deletePodcastEpisode(token, ep.id)
      if (expandedId) {
        const eps = await adminAPI.podcastEpisodes(token, expandedId)
        setEpisodes(eps || [])
      }
      refetch()
    } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Podcasts"
        description={`${podcasts?.length || 0} total podcasts`}
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreatePodcast}>
            <Plus size={15} /> Add Podcast
          </button>
        }
      />

      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search podcasts..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <Podcast size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
          <h3>No podcasts found</h3>
          <p>Add your first podcast to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((p, idx) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--admin-secondary)' }}>
                  {p.cover_url ? (
                    <img src={p.cover_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mic size={22} style={{ color: 'var(--admin-text-faint)' }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                    <span className={`badge ${p.active ? 'badge-success' : 'badge-neutral'}`}>{p.active ? 'Published' : 'Hidden'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                    {[p.host, p.category, `${p.episodes_count ?? 0} episodes`].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => toggleExpand(p.id)}>
                    <ListMusic size={13} /> Episodes <ChevronDown size={13} style={{ transform: expandedId === p.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditPodcast(p)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeletePodcast(p.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedId === p.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                    <div style={{ borderTop: '1px solid var(--admin-border)', padding: 14, background: 'var(--admin-bg)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>Episodes</span>
                        <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={openCreateEpisode}>
                          <Plus size={13} /> Add Episode
                        </button>
                      </div>
                      {episodesLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                          <Loader2 size={20} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
                        </div>
                      ) : episodes.length === 0 ? (
                        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', padding: '16px 0', textAlign: 'center' }}>No episodes yet.</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {episodes.map(ep => (
                            <div key={ep.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', background: 'var(--admin-card)' }}>
                              <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--admin-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                {ep.episode_number || '-'}
                              </span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ep.title}</div>
                                <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>
                                  {[
                                    ep.duration,
                                    ep.published_at ? ep.published_at.slice(0, 10) : null,
                                    ep.video_url ? 'has video' : null,
                                    ep.audio_url ? 'has audio' : null,
                                  ].filter(Boolean).join(' · ') || 'No media'}
                                </div>
                              </div>
                              <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditEpisode(ep)}><Pencil size={12} /></button>
                              <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteEpisode(ep)}><Trash2 size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Podcast modal ─────────────────────────── */}
      <AnimatePresence>
        {showPodcastModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPodcastModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 560 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingPodcast ? 'Edit Podcast' : 'Add New Podcast'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowPodcastModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {podcastError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>
                    {podcastError}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Podcast Title *</label>
                  <input className="admin-input" placeholder="Enter podcast title" value={podcastForm.title} onChange={e => setPodcastForm({ ...podcastForm, title: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Host</label>
                    <input className="admin-input" placeholder="e.g. Njeri Mwangi" value={podcastForm.host} onChange={e => setPodcastForm({ ...podcastForm, host: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Category</label>
                    <input className="admin-input" placeholder="e.g. Arts & Culture" value={podcastForm.category} onChange={e => setPodcastForm({ ...podcastForm, category: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Description</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Podcast description..." value={podcastForm.description} onChange={e => setPodcastForm({ ...podcastForm, description: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Cover Art</label>
                  <PodcastCoverUpload value={podcastForm.cover_url} onChange={url => setPodcastForm({ ...podcastForm, cover_url: url })} token={token} onUploadingChange={setCoverUploading} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Sort Order</label>
                    <input className="admin-input" type="number" value={podcastForm.sort_order} onChange={e => setPodcastForm({ ...podcastForm, sort_order: e.target.value })} />
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                  <input type="checkbox" className="admin-checkbox" checked={podcastForm.active} onChange={e => setPodcastForm({ ...podcastForm, active: e.target.checked })} />
                  Published (visible on the public site)
                </label>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowPodcastModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSavePodcast} disabled={podcastSaving || coverUploading}>
                  {coverUploading ? 'Uploading cover...' : podcastSaving ? 'Saving...' : editingPodcast ? 'Update Podcast' : 'Add Podcast'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Episode modal ─────────────────────────── */}
      <AnimatePresence>
        {showEpisodeModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEpisodeModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 560 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingEpisode ? 'Edit Episode' : 'Add Episode'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowEpisodeModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {episodeError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>
                    {episodeError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Episode #</label>
                    <input className="admin-input" type="number" min="1" value={episodeForm.episode_number} onChange={e => setEpisodeForm({ ...episodeForm, episode_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Title *</label>
                    <input className="admin-input" placeholder="Episode title" value={episodeForm.title} onChange={e => setEpisodeForm({ ...episodeForm, title: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Duration</label>
                    <input className="admin-input" placeholder="e.g. 45 min" value={episodeForm.duration} onChange={e => setEpisodeForm({ ...episodeForm, duration: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Published Date</label>
                    <input className="admin-input" type="date" value={episodeForm.published_at} onChange={e => setEpisodeForm({ ...episodeForm, published_at: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Description</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Episode description..." value={episodeForm.description} onChange={e => setEpisodeForm({ ...episodeForm, description: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Audio URL</label>
                  <input className="admin-input" placeholder="https://.../episode.mp3" value={episodeForm.audio_url} onChange={e => setEpisodeForm({ ...episodeForm, audio_url: e.target.value })} />
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 6 }}>Paste the MP3/audio URL. Leave empty for video-only episodes.</div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Video URL</label>
                  <input className="admin-input" placeholder="https://.../episode.mp4" value={episodeForm.video_url} onChange={e => setEpisodeForm({ ...episodeForm, video_url: e.target.value })} />
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 6 }}>Paste an MP4/video URL to make this a video podcast episode. Provide either audio or video (or both).</div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowEpisodeModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSaveEpisode} disabled={episodeSaving}>
                  {episodeSaving ? <><Save size={13} /> Saving...</> : editingEpisode ? 'Update Episode' : 'Add Episode'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PodcastCoverUpload({ value, onChange, onUploadingChange, token }: {
  value: string
  onChange: (url: string) => void
  onUploadingChange: (uploading: boolean) => void
  token: string | null
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFile = async (file: File) => {
    if (!token) return
    setUploading(true)
    setUploadError('')
    onUploadingChange(true)
    try {
      const res = await adminAPI.upload(token, file, 'podcasts')
      onChange(res.url)
    } catch (e: any) {
      setUploadError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
      onUploadingChange(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'var(--admin-secondary)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImagePlus size={20} style={{ color: 'var(--admin-text-muted)' }} />
          )}
        </div>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={14} />}
          {value ? ' Change cover' : ' Upload cover'}
        </button>
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          className="admin-input"
          style={{ fontSize: 12 }}
          placeholder="Or paste cover URL"
          value={value}
          onChange={e => onChange(e.target.value)}
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
