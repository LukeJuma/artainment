import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, Headphones, Eye, Clock, TrendingUp, Calendar,
  ArrowUpRight, ArrowDownRight, BarChart3, Download,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { ChartCard, ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'

const monthlyRevenue = [
  { month: 'Jan', revenue: 180000, target: 200000 },
  { month: 'Feb', revenue: 220000, target: 210000 },
  { month: 'Mar', revenue: 195000, target: 220000 },
  { month: 'Apr', revenue: 260000, target: 240000 },
  { month: 'May', revenue: 290000, target: 260000 },
  { month: 'Jun', revenue: 310000, target: 280000 },
  { month: 'Jul', revenue: 275000, target: 300000 },
  { month: 'Aug', revenue: 340000, target: 310000 },
  { month: 'Sep', revenue: 380000, target: 330000 },
  { month: 'Oct', revenue: 350000, target: 350000 },
  { month: 'Nov', revenue: 420000, target: 370000 },
  { month: 'Dec', revenue: 480000, target: 400000 },
]

const dailyUsers = [
  { day: '01', users: 2400, sessions: 4200 },
  { day: '05', users: 2800, sessions: 4800 },
  { day: '10', users: 3200, sessions: 5400 },
  { day: '15', users: 2900, sessions: 5100 },
  { day: '20', users: 3500, sessions: 5800 },
  { day: '25', users: 3800, sessions: 6200 },
  { day: '30', users: 4100, sessions: 6800 },
]

const streamingData = [
  { hour: '00', streams: 12000 },
  { hour: '04', streams: 4000 },
  { hour: '08', streams: 18000 },
  { hour: '12', streams: 32000 },
  { hour: '16', streams: 28000 },
  { hour: '20', streams: 45000 },
  { hour: '23', streams: 38000 },
]

const watchTimeData = [
  { day: 'Mon', avg: 42, total: 18000 },
  { day: 'Tue', avg: 45, total: 19500 },
  { day: 'Wed', avg: 38, total: 16200 },
  { day: 'Thu', avg: 48, total: 20800 },
  { day: 'Fri', avg: 52, total: 22400 },
  { day: 'Sat', avg: 58, total: 25100 },
  { day: 'Sun', avg: 55, total: 23800 },
]

const subscriptionGrowth = [
  { month: 'Jul', premium: 4200, vip: 1200, family: 800, student: 2100 },
  { month: 'Aug', premium: 4800, vip: 1400, family: 900, student: 2300 },
  { month: 'Sep', premium: 5200, vip: 1600, family: 1000, student: 2500 },
  { month: 'Oct', premium: 5800, vip: 1800, family: 1100, student: 2700 },
  { month: 'Nov', premium: 6400, vip: 2000, family: 1200, student: 2900 },
  { month: 'Dec', premium: 7100, vip: 2300, family: 1400, student: 3100 },
]

const topPages = [
  { page: '/movies/rising-sun', views: 45200, bounce: 12 },
  { page: '/mic-mtaani/live', views: 38900, bounce: 8 },
  { page: '/events/afrobeats-night', views: 22100, bounce: 15 },
  { page: '/music/trending', views: 19800, bounce: 18 },
  { page: '/podcasts/the-pod-cast', views: 15600, bounce: 22 },
  { page: '/artists/sauti-sol', views: 14200, bounce: 10 },
]

const stats = [
  { title: 'Monthly Revenue', value: 'KES ', numericValue: 2400000, change: 12.5, icon: DollarSign, color: '#FF4D2D', chartData: [18, 22, 19, 26, 29, 31, 27, 34, 38, 35, 42, 48] },
  { title: 'Daily Active Users', value: '', numericValue: 4100, change: 18.2, icon: Users, color: '#3B82F6', chartData: [24, 28, 32, 29, 35, 38, 41] },
  { title: 'Avg. Watch Time', value: '', numericValue: 47, suffix: ' min', change: 5.8, icon: Clock, color: '#8B5CF6', chartData: [42, 45, 38, 48, 52, 58, 55] },
  { title: 'Total Streams', value: '', numericValue: 4200000, change: 23.1, icon: Headphones, color: '#2DD36F', chartData: [32, 38, 42, 45, 48, 52, 55] },
]

export function AnalyticsPage() {
  const [period, setPeriod] = useState('30d')

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Comprehensive insights across your platform"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="admin-select" value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="admin-btn admin-btn-secondary">
              <Download size={15} />
              Export
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {stats.map((s, i) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            numericValue={s.numericValue}
            change={s.change}
            icon={<s.icon size={20} strokeWidth={2} />}
            color={s.color}
            chartData={s.chartData}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Revenue + Users Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 28 }}>
        <ChartCard title="Revenue vs Target" subtitle="Monthly revenue performance" delay={0.3}>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D2D" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#FF4D2D" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number, name: string) => [`KES ${(val / 1000).toFixed(0)}K`, name === 'revenue' ? 'Revenue' : 'Target']} />
                <Bar dataKey="revenue" fill="url(#revBarGrad)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="target" fill="rgba(255,255,255,0.08)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--admin-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--admin-text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: '#FF4D2D' }} />
              Actual Revenue
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--admin-text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />
              Target
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Daily Users" subtitle="Active users & sessions" delay={0.4}>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUsers} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="duGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="duGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="sessions" stroke="#8B5CF6" strokeWidth={1.5} fill="url(#duGrad2)" dot={false} />
                <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fill="url(#duGrad1)" dot={false} activeDot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Streaming + Watch Time + Subscriptions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
        <ChartCard title="Streaming Hours" subtitle="Streams by time of day" delay={0.5}>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streamingData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="stGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DD36F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#2DD36F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="hour" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number) => [`${(val / 1000).toFixed(1)}K`, 'Streams']} />
                <Area type="monotone" dataKey="streams" stroke="#2DD36F" strokeWidth={2} fill="url(#stGrad)" dot={false} activeDot={{ r: 4, fill: '#2DD36F', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Watch Time" subtitle="Average minutes per session" delay={0.6}>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={watchTimeData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number) => [`${val} min`, 'Avg. Watch Time']} />
                <Line type="monotone" dataKey="avg" stroke="#FFB800" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFB800', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Subscription Growth" subtitle="New subscribers by plan" delay={0.7}>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subscriptionGrowth} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="premium" stackId="a" fill="#FF4D2D" radius={[0, 0, 0, 0]} />
                <Bar dataKey="vip" stackId="a" fill="#FFB800" />
                <Bar dataKey="family" stackId="a" fill="#3B82F6" />
                <Bar dataKey="student" stackId="a" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {[{ label: 'Premium', color: '#FF4D2D' }, { label: 'VIP', color: '#FFB800' }, { label: 'Family', color: '#3B82F6' }, { label: 'Student', color: '#8B5CF6' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--admin-text-muted)' }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Pages */}
      <motion.div
        className="admin-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="admin-card-header">
          <div className="admin-card-title">Top Pages</div>
          <button className="admin-btn admin-btn-ghost admin-btn-sm">
            <Download size={13} />
            Export
          </button>
        </div>
        <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Bounce Rate</th>
                <th style={{ width: 180 }}>Traffic</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p, idx) => {
                const maxViews = topPages[0].views
                const pct = (p.views / maxViews) * 100
                return (
                  <motion.tr
                    key={p.page}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85 + idx * 0.04 }}
                  >
                    <td>
                      <span style={{ fontFamily: "'Inter', monospace", fontSize: 13, color: 'var(--admin-text)' }}>{p.page}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{p.views.toLocaleString()}</td>
                    <td>
                      <span style={{ color: p.bounce < 15 ? 'var(--admin-success)' : p.bounce < 20 ? 'var(--admin-accent)' : 'var(--admin-danger)' }}>
                        {p.bounce}%
                      </span>
                    </td>
                    <td>
                      <div className="admin-progress" style={{ width: '100%' }}>
                        <div className="admin-progress-bar" style={{ width: `${pct}%`, background: 'var(--admin-primary)' }} />
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
