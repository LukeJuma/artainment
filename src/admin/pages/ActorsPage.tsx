import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Trash2, Pencil, Star, X, Loader2, ImagePlus, AtSign, Share2, Link2, Music2, Globe } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { talentAPI, adminAPI, type Talent } from '../../lib/api'

const socialFields = [
  { key: 'instagram', label: 'Instagram', icon: AtSign },
  { key: 'twitter', label: 'Twitter / X', icon: AtSign },
  { key: 'facebook', label: 'Facebook', icon: Share2 },
  { key: 'tiktok', label: 'TikTok', icon: Music2 },
  { key: 'linkedin', label: 'LinkedIn', icon: Link2 },
  { key: 'website', label: 'Website', icon: Globe },
]

interface ActorForm {
  name: string
  role: string
  bio: string
  credits: string
  image_url: string
  reel_url: string
  active: boolean
  socials: Record<string, string>
}

const emptyForm: ActorForm = {
  name: '', role: '', bio: '', credits: '0', image_url: '', reel_url: '',
  active: true, socials: { instagram: '', twitter: '', facebook: '', tiktok: '', linkedin: '', website: '' },
}

export function ActorsPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Talent | null>(null)
  const [form, setForm] = useState<ActorForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [uploading, setUploading] = useState(false)

  const { data: talent, loading, refetch } = useApi(() => talentAPI.list(), [])

  const filtered = (talent || []).filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || (t.role || '').toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }, [])

  const openEdit = useCallback((actor: Talent) => {
    setEditing(actor)
    setForm({
      name: actor.name,
      role: actor.role || '',
      bio: actor.bio || '',
      credits: String(actor.credits || 0),
      image_url: actor.image_url || '',
      reel_url: actor.reel_url || '',
      active: actor.active,
      socials: {
        instagram: actor.socials?.instagram || '',
        twitter: actor.socials?.twitter || '',
        facebook: actor.socials?.facebook || '',
        tiktok: actor.socials?.tiktok || '',
        linkedin: actor.socials?.linkedin || '',
        website: actor.socials?.website || '',
      },
    })
    setFormError('')
    setShowModal(true)
  }, [])

  const handleSubmit = async () => {
    if (!form.name.trim()) { setFormError('Name is required.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const socials: Record<string, string> = {}
      for (const f of socialFields) {
        if (form.socials[f.key]?.trim()) socials[f.key] = form.socials[f.key].trim()
      }
      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        bio: form.bio.trim() || null,
        credits: Number(form.credits) || 0,
        image_url: form.image_url || null,
        reel_url: form.reel_url.trim() || null,
        active: form.active,
        socials: Object.keys(socials).length ? socials : null,
      }
      if (editing) {
        await adminAPI.updateTalent(token!, editing.id, payload)
      } else {
        await adminAPI.createTalent(token!, payload)
      }
      setShowModal(false)
      refetch()
    } catch (e: any) {
      setFormError(e.message || 'Failed to save actor.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this actor? This cannot be undone.')) return
    try { await adminAPI.deleteTalent(token, id); refetch() } catch {}
  }

  const socialsCount = (t: Talent) => (t.socials ? Object.values(t.socials).filter(Boolean).length : 0)

  return (
    <div>
      <PageHeader
        title="Actors"
        description={`${talent?.length || 0} total actors in the collective`}
        actions={
          <button className="admin-btn admin-btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Actor
          </button>
        }
      />

      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search actors..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="admin-empty">
          <Star size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
          <h3>No actors found</h3>
          <p>Add your first actor profile to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map((actor, idx) => (
            <motion.div
              key={actor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="admin-card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div style={{ height: 210, position: 'relative', background: 'var(--admin-secondary)' }}>
                {actor.image_url ? (
                  <img src={actor.image_url} alt={actor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, fontWeight: 800, color: 'var(--admin-text-faint)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {actor.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <span className={`badge ${actor.active ? 'badge-success' : 'badge-warning'}`}>{actor.active ? 'Active' : 'Hidden'}</span>
                </div>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actor.name}</span>
                  {actor.slug && <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>@{actor.slug}</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 10 }}>
                  {actor.role || 'Actor'} · {actor.credits || 0} credits · {socialsCount(actor)} social links
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ flex: 1 }} onClick={() => openEdit(actor)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(actor.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 640 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editing ? 'Edit Actor' : 'Add New Actor'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Name *</label>
                    <input className="admin-input" placeholder="Enter actor name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Role</label>
                    <input className="admin-input" placeholder="e.g. Lead Actor" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Credits</label>
                    <input className="admin-input" type="number" min="0" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Reel URL</label>
                    <input className="admin-input" placeholder="https://..." value={form.reel_url} onChange={e => setForm({ ...form, reel_url: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Bio</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Short bio about this actor..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Profile Photo</label>
                  <ActorPhotoUpload value={form.image_url} onChange={url => setForm({ ...form, image_url: url })} token={token} onUploadingChange={setUploading} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Social Media Links</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {socialFields.map(sf => {
                      const Icon = sf.icon
                      return (
                        <div key={sf.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--admin-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-muted)', flexShrink: 0 }}>
                            <Icon size={15} />
                          </span>
                          <input
                            className="admin-input"
                            style={{ flex: 1 }}
                            placeholder={`${sf.label} URL`}
                            value={form.socials[sf.key] || ''}
                            onChange={e => setForm({ ...form, socials: { ...form.socials, [sf.key]: e.target.value } })}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                  <input type="checkbox" className="admin-checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                  Visible on the public Actors page
                </label>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={formLoading || uploading}>
                  {uploading ? 'Uploading photo...' : formLoading ? 'Saving...' : editing ? 'Update Actor' : 'Add Actor'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--admin-text-muted)' }}>
        Showing {filtered.length} of {talent?.length || 0} actors
      </div>
    </div>
  )
}

function ActorPhotoUpload({ value, onChange, onUploadingChange, token }: {
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
      const res = await adminAPI.upload(token, file, 'actors')
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
        <div style={{ width: 72, height: 72, borderRadius: 14, overflow: 'hidden', flexShrink: 0, background: 'var(--admin-secondary)', border: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {value ? (
            <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImagePlus size={20} style={{ color: 'var(--admin-text-muted)' }} />
          )}
        </div>
        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={14} />}
          {value ? ' Change photo' : ' Upload photo'}
        </button>
      </div>
      <div style={{ marginTop: 8 }}>
        <input
          className="admin-input"
          style={{ fontSize: 12 }}
          placeholder="Or paste image URL"
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
