import { useState } from 'react'
import { motion } from 'framer-motion'
import { Tv, Search, Plus, Star, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { productionsAPI, type Production } from '../../lib/api'

interface SeriesItem {
  id: number
  title: string
  seasons: number
  episodes: number
  genre: string
  rating: number
  views: string
  status: string
}

function mapProduction(p: Production): SeriesItem {
  return {
    id: p.id,
    title: p.title,
    seasons: 1,
    episodes: 1,
    genre: p.type || 'Drama',
    rating: 8.0,
    views: '-',
    status: p.status === 'completed' ? 'Completed' : p.status === 'in_production' ? 'Active' : 'Hiatus',
  }
}

const statusColors: Record<string, string> = {
  Active: 'badge-success', Hiatus: 'badge-warning', Completed: 'badge-info',
}

export function SeriesPage() {
  const [search, setSearch] = useState('')

  const { data: rawProductions, loading } = useApi<Production[]>(() => productionsAPI.list(), [])
  const series: SeriesItem[] = (rawProductions || []).map(mapProduction)

  const filtered = series.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--admin-text-muted)' }}>
        Loading series...
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="TV Series" description={`${series.length} series in your library`} actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Add Series</button>} />
      <div className="admin-filter-bar">
        <div className="search-input"><Search size={15} style={{ color: 'var(--admin-text-muted)' }} /><input type="text" placeholder="Search series..." value={search} onChange={e => setSearch(e.target.value)} />{search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((s, idx) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.04 }} whileHover={{ y: -3 }} className="admin-card" style={{ cursor: 'pointer', overflow: 'hidden', padding: 0 }}>
            <div style={{ height: 120, background: `linear-gradient(135deg, rgba(59,130,246,.15), rgba(139,92,246,.1))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tv size={32} style={{ color: 'var(--admin-info)', opacity: 0.5 }} /></div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.title}</span>
                <span className={`badge ${statusColors[s.status] || 'badge-neutral'}`}>{s.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 10 }}>
                <span>{s.seasons} seasons</span><span>{s.episodes} episodes</span><span>{s.genre}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--admin-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}><Star size={12} style={{ color: 'var(--admin-accent)', fill: 'var(--admin-accent)' }} /><span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{s.rating}</span></div>
                <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{s.views} views</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
