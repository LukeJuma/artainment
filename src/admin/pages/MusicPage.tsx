import { useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Search, Plus, Play, Download, Headphones, Disc, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { talentAPI } from '../../lib/api'

const statusColors: Record<string, string> = { Published: 'badge-success', Draft: 'badge-neutral' }

export function MusicPage() {
  const [search, setSearch] = useState('')
  const { data: talent, loading } = useApi(() => talentAPI.list(), [])

  const tracks = (talent ?? []).map(t => ({
    id: t.id,
    title: t.name,
    artist: t.name,
    album: t.role,
    genre: t.role,
    streams: `${t.credits * 100}K`,
    downloads: `${t.credits * 10}K`,
    revenue: `KES ${t.credits * 50}K`,
    status: t.active ? 'Published' : 'Draft',
  }))

  const filtered = tracks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div>
        <PageHeader title="Music" description="Manage music catalog and streaming data" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Upload Music</button>} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--admin-text-muted)' }}>Loading music data...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Music" description="Manage music catalog and streaming data" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Upload Music</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Tracks', value: tracks.length.toLocaleString(), color: '#8B5CF6', icon: Music },
          { label: 'Total Streams', value: `${tracks.reduce((sum, t) => sum + parseInt(t.streams) || 0, 0).toLocaleString()}K`, color: '#3B82F6', icon: Headphones },
          { label: 'Downloads', value: `${tracks.reduce((sum, t) => sum + parseInt(t.downloads) || 0, 0).toLocaleString()}K`, color: '#2DD36F', icon: Download },
          { label: 'Revenue', value: `KES ${tracks.reduce((sum, t) => sum + parseInt(t.revenue.replace(/[^0-9]/g, '')) || 0, 0).toLocaleString()}K`, color: '#FF4D2D', icon: Disc },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}><Icon size={16} strokeWidth={2} /></div>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div><div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{item.label}</div></div>
            </motion.div>
          )
        })}
      </div>
      <div className="admin-filter-bar"><div className="search-input"><Search size={15} style={{ color: 'var(--admin-text-muted)' }} /><input type="text" placeholder="Search tracks..." value={search} onChange={e => setSearch(e.target.value)} />{search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}</div></div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Track</th><th>Artist</th><th>Genre</th><th>Streams</th><th>Downloads</th><th>Revenue</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map((t, idx) => (
              <motion.tr key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(139,92,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}><Play size={14} fill="currentColor" /></div><div><div className="cell-primary">{t.title}</div><div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{t.album}</div></div></div></td>
                <td>{t.artist}</td>
                <td><span className="admin-tag">{t.genre}</span></td>
                <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{t.streams}</td>
                <td>{t.downloads}</td>
                <td style={{ fontWeight: 600, color: 'var(--admin-success)' }}>{t.revenue}</td>
                <td><span className={`badge ${statusColors[t.status]}`}><span className="badge-dot" />{t.status}</span></td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
