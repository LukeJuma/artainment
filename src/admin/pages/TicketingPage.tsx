import { useState } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Search, Plus, Calendar, DollarSign, Users, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ChartCard, ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { mmAPI } from '../../lib/api'

const ticketSalesData = [
  { day: 'Mon', vip: 45, regular: 120 }, { day: 'Tue', vip: 52, regular: 145 }, { day: 'Wed', vip: 38, regular: 98 },
  { day: 'Thu', vip: 65, regular: 178 }, { day: 'Fri', vip: 78, regular: 234 }, { day: 'Sat', vip: 92, regular: 312 },
  { day: 'Sun', vip: 48, regular: 156 },
]

const statusColors: Record<string, string> = { 'Sold Out': 'badge-success', Active: 'badge-info' }

export function TicketingPage() {
  const [search, setSearch] = useState('')
  const { data: events, loading } = useApi(() => mmAPI.events(), [])

  const tickets = (events ?? []).flatMap(e => [
    { id: e.id * 100 + 1, event: e.title, type: 'VIP' as const, price: 'KES 3,500', sold: Math.floor(e.id * 200), total: Math.floor(e.id * 250), revenue: `KES ${(e.id * 700).toLocaleString()}K`, status: e.status === 'upcoming' ? 'Active' : 'Sold Out' },
    { id: e.id * 100 + 2, event: e.title, type: 'Regular' as const, price: 'KES 1,500', sold: Math.floor(e.id * 1875), total: Math.floor(e.id * 2000), revenue: `KES ${(e.id * 2800).toLocaleString()}K`, status: e.status === 'upcoming' ? 'Active' : 'Sold Out' },
  ])

  const totalSold = tickets.reduce((sum, t) => sum + t.sold, 0)
  const totalRevenue = tickets.reduce((sum, t) => sum + parseInt(t.revenue.replace(/[^0-9]/g, '')) || 0, 0)
  const activeEvents = (events ?? []).filter(e => e.status === 'upcoming').length
  const avgCapacity = tickets.length > 0 ? Math.round(tickets.reduce((sum, t) => sum + (t.sold / t.total) * 100, 0) / tickets.length) : 0

  const filtered = tickets.filter(t => t.event.toLowerCase().includes(search.toLowerCase()))

  if (loading) {
    return (
      <div>
        <PageHeader title="Ticketing" description="Manage tickets across all events" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Create Ticket Type</button>} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--admin-text-muted)' }}>Loading ticketing data...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Ticketing" description="Manage tickets across all events" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Create Ticket Type</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Sold', value: totalSold.toLocaleString(), icon: Ticket, color: '#FF4D2D' },
          { label: 'Revenue', value: `KES ${totalRevenue.toLocaleString()}K`, icon: DollarSign, color: '#2DD36F' },
          { label: 'Active Events', value: String(activeEvents), icon: Calendar, color: '#3B82F6' },
          { label: 'Avg. Capacity', value: `${avgCapacity}%`, icon: Users, color: '#FFB800' },
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

      <ChartCard title="Ticket Sales This Week" subtitle="VIP vs Regular tickets" delay={0.3}>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ticketSalesData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="vip" fill="#FFB800" radius={[4, 4, 0, 0]} barSize={18} name="VIP" />
              <Bar dataKey="regular" fill="#FF4D2D" radius={[4, 4, 0, 0]} barSize={18} name="Regular" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div style={{ marginTop: 20 }}>
        <div className="admin-filter-bar"><div className="search-input"><Search size={15} style={{ color: 'var(--admin-text-muted)' }} /><input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />{search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}</div></div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Event</th><th>Type</th><th>Price</th><th>Sold</th><th>Revenue</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map((t, idx) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                  <td className="cell-primary">{t.event}</td>
                  <td><span className={`badge ${t.type === 'VIP' ? 'badge-warning' : 'badge-neutral'}`}>{t.type}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{t.price}</td>
                  <td>{t.sold.toLocaleString()} / {t.total.toLocaleString()}</td>
                  <td style={{ fontWeight: 600, color: 'var(--admin-success)' }}>{t.revenue}</td>
                  <td><span className={`badge ${statusColors[t.status]}`}><span className="badge-dot" />{t.status}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
