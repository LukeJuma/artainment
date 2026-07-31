import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, X, Check, Loader2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { talentAPI, type Talent } from '../../lib/api'

interface Artist {
  id: number
  name: string
  genre: string
  followers: string
  revenue: string
  verified: boolean
  status: string
  albums: number
}

function mapTalentToArtist(talent: Talent): Artist {
  return {
    id: talent.id,
    name: talent.name,
    genre: talent.role,
    followers: '-',
    revenue: '-',
    verified: talent.active,
    status: talent.active ? 'Active' : 'Pending',
    albums: talent.credits,
  }
}

const gradients = [
  'linear-gradient(135deg, #FF4D2D, #FFB800)', 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  'linear-gradient(135deg, #2DD36F, #06B6D4)', 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #FFB800, #FF4D2D)', 'linear-gradient(135deg, #EF4444, #F59E0B)',
]

export function ArtistsPage() {
  const [search, setSearch] = useState('')

  const { data: rawTalent, loading } = useApi(() => talentAPI.list(), [])

  const artists: Artist[] = rawTalent ? rawTalent.map(mapTalentToArtist) : []

  const filtered = artists.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Loader2 size={32} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Artists" description="Manage artist profiles and verification" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Add Artist</button>} />
      <div className="admin-filter-bar"><div className="search-input"><Search size={15} style={{ color: 'var(--admin-text-muted)' }} /><input type="text" placeholder="Search artists..." value={search} onChange={e => setSearch(e.target.value)} />{search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}</div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((artist, idx) => (
          <motion.div key={artist.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,.25)' }} className="admin-card" style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
            <div style={{ height: 80, background: gradients[idx % gradients.length], opacity: 0.8 }} />
            <div style={{ padding: '0 22px 22px', marginTop: -24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: gradients[idx % gradients.length], border: '3px solid var(--admin-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>
                  {artist.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{artist.name}</span>
                    {artist.verified && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--admin-info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={10} style={{ color: '#fff' }} /></div>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{artist.genre} · {artist.albums} albums</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid var(--admin-border)' }}>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{artist.followers}</div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Followers</div></div>
                <div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-success)' }}>{artist.revenue}</div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Revenue</div></div>
                <div><span className={`badge ${artist.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{artist.status}</span></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
