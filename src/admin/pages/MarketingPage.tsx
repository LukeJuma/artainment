import { motion } from 'framer-motion'
import { Megaphone, TrendingUp, Percent, Users } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { ChartCard, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { newsAPI } from '../../lib/api'

const bannerData = [
  { impressions: 145000, clicks: 8900 },
  { impressions: 168000, clicks: 10200 },
  { impressions: 155000, clicks: 9500 },
  { impressions: 189000, clicks: 12100 },
  { impressions: 210000, clicks: 13400 },
  { impressions: 245000, clicks: 15800 },
  { impressions: 198000, clicks: 12600 },
].map((d, i) => ({ day: `Day ${i + 1}`, ...d }))

export function MarketingPage() {
  const { data: news, loading } = useApi(() => newsAPI.list(), [])

  const campaigns = (news || []).map(n => ({
    id: n.id,
    name: n.title,
    type: n.category || 'Content',
    status: 'Active' as const,
    reach: n.id * 1000,
    conversion: 5 + (n.id % 10),
    spend: `KES ${n.id * 5}K`,
    color: '#3B82F6',
  }))

  if (loading) {
    return (
      <div>
        <PageHeader title="Marketing" description="Campaigns, banners, and promotional tools" actions={<button className="admin-btn admin-btn-primary"><Megaphone size={15} /> New Campaign</button>} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: 'var(--admin-text-muted)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Marketing" description="Campaigns, banners, and promotional tools" actions={<button className="admin-btn admin-btn-primary"><Megaphone size={15} /> New Campaign</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Active Campaigns', value: campaigns.length.toString(), icon: Megaphone, color: '#FF4D2D' },
          { label: 'Total Reach', value: `${(campaigns.reduce((s, c) => s + c.reach, 0) / 1000).toFixed(0)}K`, icon: Users, color: '#3B82F6' },
          { label: 'Avg. Conversion', value: campaigns.length > 0 ? `${(campaigns.reduce((s, c) => s + c.conversion, 0) / campaigns.length).toFixed(1)}%` : '0%', icon: TrendingUp, color: '#2DD36F' },
          { label: 'Coupons Active', value: '8', icon: Percent, color: '#FFB800' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '16px 18px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, marginBottom: 10 }}><Icon size={15} strokeWidth={2} /></div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 2 }}>{item.label}</div>
            </motion.div>
          )
        })}
      </div>

      <ChartCard title="Campaign Performance" subtitle="Impressions vs clicks over 7 days" delay={0.3}>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={bannerData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="mktGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
                <linearGradient id="mktGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4D2D" stopOpacity={0.2} /><stop offset="100%" stopColor="#FF4D2D" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="impressions" stroke="#3B82F6" strokeWidth={2} fill="url(#mktGrad1)" dot={false} name="Impressions" />
              <Area type="monotone" dataKey="clicks" stroke="#FF4D2D" strokeWidth={2} fill="url(#mktGrad2)" dot={false} name="Clicks" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div style={{ marginTop: 24 }}>
        <div className="admin-card-header" style={{ marginBottom: 16 }}>
          <div className="admin-card-title">Active Campaigns</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {campaigns.map((c, idx) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + idx * 0.05 }} className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}><Megaphone size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', display: 'flex', gap: 12, marginTop: 2 }}>
                  <span>{c.type}</span>
                  <span>{c.reach > 0 ? `${(c.reach / 1000).toFixed(1)}K reach` : 'Not started'}</span>
                  {c.conversion > 0 && <span>{c.conversion}% CTR</span>}
                </div>
              </div>
              <span className={`badge ${c.status === 'Active' ? 'badge-success' : c.status === 'Scheduled' ? 'badge-info' : 'badge-neutral'}`}>
                <span className="badge-dot" />{c.status}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text-secondary)' }}>{c.spend}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
