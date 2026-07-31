import { useState } from 'react'
import { motion } from 'framer-motion'
import { Podcast, Search, Plus, Clock, Users, DollarSign, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { servicesAPI } from '../../lib/api'

export function PodcastsPage() {
  const [search, setSearch] = useState('')
  const { data: services, loading } = useApi(() => servicesAPI.list(), [])

  const podcasts = (services ?? []).map(s => ({
    id: s.id,
    title: s.title,
    host: 'Artainment Team',
    category: s.title,
    episodes: s.id * 5,
    listeners: `${s.id * 10}K`,
    revenue: `KES ${s.id * 30}K`,
    status: s.active ? 'Published' : 'Draft',
  }))

  const filtered = podcasts.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div>
        <PageHeader title="Podcasts" description="Manage podcast episodes and sponsors" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Add Podcast</button>} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--admin-text-muted)' }}>Loading podcasts data...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Podcasts" description="Manage podcast episodes and sponsors" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Add Podcast</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Podcasts', value: podcasts.length.toLocaleString(), icon: Podcast, color: '#3B82F6' },
          { label: 'Total Listeners', value: `${podcasts.reduce((sum, p) => sum + parseInt(p.listeners) || 0, 0).toLocaleString()}K`, icon: Users, color: '#8B5CF6' },
          { label: 'Avg. Duration', value: '42 min', icon: Clock, color: '#2DD36F' },
          { label: 'Ad Revenue', value: `KES ${podcasts.reduce((sum, p) => sum + parseInt(p.revenue.replace(/[^0-9]/g, '')) || 0, 0).toLocaleString()}K`, icon: DollarSign, color: '#FFB800' },
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
      <div className="admin-filter-bar"><div className="search-input"><Search size={15} style={{ color: 'var(--admin-text-muted)' }} /><input type="text" placeholder="Search podcasts..." value={search} onChange={e => setSearch(e.target.value)} />{search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}</div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((p, idx) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.04 }} whileHover={{ y: -2 }} className="admin-card" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}><Podcast size={20} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{p.host}</div>
              </div>
              <span className={`badge ${p.status === 'Published' ? 'badge-success' : 'badge-neutral'}`}>{p.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, padding: '12px 0', borderTop: '1px solid var(--admin-border)' }}>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{p.episodes}</div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Episodes</div></div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{p.listeners}</div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Listeners</div></div>
              <div><div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-success)' }}>{p.revenue}</div><div style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>Revenue</div></div>
            </div>
          </motion.div>
        ))}
      </div>
      <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
