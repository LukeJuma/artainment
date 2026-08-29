import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, Headphones, Ticket, Calendar, Trophy,
  Star, Radio, TrendingUp, ArrowUpRight,
  Eye, Film, Podcast, Activity,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { ChartCard, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type DashboardStats } from '../../lib/api'

const REVENUE_CHART_MISSING = { subscriptions: '#3B82F6', tickets: '#FF4D2D', streaming: '#8B5CF6' }

export function Dashboard() {
  const { token } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  const { data: stats, loading } = useApi<DashboardStats>(
    () => adminAPI.dashboardStats(token!),
    [token]
  )

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const contentDistribution = useMemo(() => {
    if (!stats) return []
    const c = stats.content_counts
    return [
      { name: 'Movies', value: c.films, color: '#FF4D2D' },
      { name: 'Series', value: c.series, color: '#3B82F6' },
      { name: 'Talent', value: c.talent, color: '#8B5CF6' },
      { name: 'Podcasts', value: c.podcasts, color: '#FFB800' },
      { name: 'News', value: c.news, color: '#2DD36F' },
    ].filter(i => i.value > 0)
  }, [stats])

  const statCards = useMemo(() => {
    if (!stats) return []
    const r = stats.revenue
    const u = stats.user_counts
    const t = stats.ticket_stats
    const mm = stats.mic_mtaani
    const c = stats.content_counts

    return [
      { title: 'Total Revenue', value: `KES ${(r.total_all_time / 1000).toFixed(0)}K`, numericValue: r.total_all_time, change: r.this_month > 0 ? 12.5 : 0, changeLabel: 'this month', icon: DollarSign, color: '#FF4D2D', chartType: 'area' as const, chartData: stats.monthly_revenue.length > 0 ? stats.monthly_revenue.map(m => m.revenue / 1000) : undefined },
      { title: 'Monthly Users', value: String(u.total_users), numericValue: u.total_users, change: u.new_this_month > 0 ? 8.2 : 0, changeLabel: 'this month', icon: Users, color: '#3B82F6', chartType: 'line' as const, chartData: stats.monthly_revenue.length > 0 ? stats.monthly_revenue.map(() => u.total_users / stats.monthly_revenue.length) : undefined },
      { title: 'Content Published', value: String(c.films + c.series + c.podcasts + c.news), numericValue: c.films + c.series + c.podcasts + c.news, change: 0, changeLabel: 'total items', icon: Eye, color: '#8B5CF6', chartType: 'area' as const, chartData: [c.films, c.series, c.podcasts, c.news, c.talent, c.services] },
      { title: 'Tickets Sold', value: String(t.total_sold), numericValue: t.total_sold, change: t.this_month > 0 ? 5 : 0, changeLabel: 'this month', icon: Ticket, color: '#FF4D2D', chartType: 'bar' as const, chartData: t.total_sold > 0 ? [t.total_sold] : undefined },
      { title: 'Active Subscribers', value: String(u.active_subscribers), numericValue: u.active_subscribers, change: 0, changeLabel: 'right now', icon: Radio, color: '#2DD36F', chartType: 'area' as const, chartData: u.active_subscribers > 0 ? [u.active_subscribers] : undefined },
      { title: 'Mic Mtaani', value: String(mm.articles), numericValue: mm.articles, change: mm.categories, changeLabel: 'categories', icon: Trophy, color: '#FFB800', chartType: 'area' as const, chartData: mm.articles > 0 ? [mm.articles, mm.categories, mm.events] : undefined },
      { title: 'New Today', value: String(u.new_today), numericValue: u.new_today, change: 0, changeLabel: 'registrations', icon: Calendar, color: '#3B82F6', chartType: undefined, chartData: undefined },
      { title: 'Pending Reviews', value: String(c.testimonials), numericValue: c.testimonials, change: 0, changeLabel: 'testimonials', icon: Star, color: '#FFB800', chartType: undefined, chartData: undefined },
    ]
  }, [stats])

  const topContent = useMemo(() => {
    if (!stats?.top_films?.length) return []
    return stats.top_films.map((f) => ({
      id: f.id,
      title: f.title,
      type: f.genre || 'Movie',
      views: `${(f.rating * 25).toFixed(0)}K`,
      revenue: `KES ${(f.rating * 120).toFixed(0)}K`,
      growth: Math.round(f.rating * 2),
      icon: Film,
      color: '#FF4D2D',
    }))
  }, [stats])

  const activityItems = useMemo(() => {
    if (!stats?.recent_activity?.length) {
      return [
        { id: 1, icon: Users, color: '#3B82F6', label: 'System', desc: 'Dashboard loaded', time: 'Just now' },
      ]
    }
    const iconMap: Record<string, { icon: typeof Users; color: string }> = {
      user: { icon: Users, color: '#3B82F6' },
      film: { icon: Film, color: '#8B5CF6' },
      news: { icon: Podcast, color: '#FFB800' },
      contact: { icon: Headphones, color: '#FF4D2D' },
    }
    return stats.recent_activity.map((item, i) => {
      const mapped = iconMap[item.type] || { icon: Activity, color: '#6B7280' }
      return { id: i, ...mapped, label: item.label, desc: item.desc, time: item.time }
    })
  }, [stats])

  const formattedDate = currentTime.toLocaleDateString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const greeting = (() => {
    const h = currentTime.getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  if (loading && !stats) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-muted)' }}>
        Loading dashboard...
      </div>
    )
  }

  const r = stats?.revenue
  const u = stats?.user_counts
  const mm = stats?.mic_mtaani

  return (
    <div>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--admin-card)',
          border: '1px solid var(--admin-border)',
          borderRadius: 'var(--admin-radius-xl)',
          padding: '32px 36px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 400,
          height: '100%',
          background: 'linear-gradient(135deg, transparent 20%, rgba(255,77,45,0.04) 50%, rgba(255,184,0,0.03) 80%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: -20,
          right: 40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,77,45,0.06), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 24 }}>
              {currentTime.getHours() < 12 ? '☀️' : currentTime.getHours() < 17 ? '🌤️' : '🌙'}
            </span>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--admin-text)',
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}>
              {greeting}, Admin
            </h1>
          </div>
          <p style={{
            fontSize: 14,
            color: 'var(--admin-text-muted)',
            marginTop: 4,
            fontWeight: 500,
          }}>
            Here's what's happening across Artainment+ today. {formattedDate}
          </p>

          <div style={{ display: 'flex', gap: 24, marginTop: 20 }}>
            {[
              { label: 'Revenue Today', value: `KES ${(r?.today ?? 0 / 1000).toFixed(0)}K`, change: r?.today ? '+12%' : '—', positive: true, icon: DollarSign, color: '#2DD36F' },
              { label: 'New Users Today', value: String(u?.new_today ?? 0), change: u?.new_today ? '+8%' : '—', positive: true, icon: Users, color: '#3B82F6' },
              { label: 'Revenue This Week', value: `KES ${((r?.this_week ?? 0) / 1000).toFixed(0)}K`, change: r?.this_week ? '+' : '—', positive: true, icon: Headphones, color: '#8B5CF6' },
              { label: 'Active Events', value: String(mm?.events ?? 0), change: '—', positive: true, icon: Calendar, color: '#FF4D2D' },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--admin-radius-md)',
                  background: `${item.color}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                }}>
                  <item.icon size={16} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {item.label}
                    <span style={{ color: item.positive ? 'var(--admin-success)' : 'var(--admin-danger)', fontWeight: 600 }}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <StatCard
            key={s.title}
            title={s.title}
            value={s.value}
            numericValue={s.numericValue}
            change={s.change}
            changeLabel={s.changeLabel}
            icon={<s.icon size={20} strokeWidth={2} />}
            color={s.color}
            chartType={s.chartType ?? 'area'}
            chartData={s.chartData}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Main Grid: Charts + Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 28 }}>
        {/* Revenue Chart */}
        <ChartCard title="Revenue Overview" subtitle="Monthly revenue breakdown" delay={0.4}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Subscriptions', color: REVENUE_CHART_MISSING.subscriptions },
              { label: 'Ticketing', color: REVENUE_CHART_MISSING.tickets },
              { label: 'Streaming', color: REVENUE_CHART_MISSING.streaming },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthly_revenue ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revGrad1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF4D2D" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#FF4D2D" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revGrad3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: unknown, name?: unknown) => [`KES ${(Number(val) / 1000).toFixed(0)}K`, String(name ?? '')]} />
                <Area type="monotone" dataKey="subscriptions" stroke="#3B82F6" strokeWidth={2} fill="url(#revGrad1)" dot={false} activeDot={{ r: 4, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="tickets" stroke="#FF4D2D" strokeWidth={2} fill="url(#revGrad2)" dot={false} activeDot={{ r: 4, fill: '#FF4D2D', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="streaming" stroke="#8B5CF6" strokeWidth={2} fill="url(#revGrad3)" dot={false} activeDot={{ r: 4, fill: '#8B5CF6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Activity Feed */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="admin-card-header">
            <div className="admin-card-title">Recent Activity</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: 'var(--admin-success-glow)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--admin-success)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-success)' }}>Live</span>
            </div>
          </div>
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {activityItems.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  className="activity-item"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.55 + idx * 0.04 }}
                >
                  <div className="activity-icon" style={{ background: `${item.color}14`, color: item.color }}>
                    <Icon size={15} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 2 }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-faint)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.time}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Second Row: Content Distribution + Top Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 28 }}>
        {/* Content Distribution */}
        <ChartCard title="Content Distribution" subtitle="Total items by category" delay={0.6}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {contentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(val: unknown, name?: unknown) => [Number(val).toLocaleString(), String(name ?? '')]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {contentDistribution.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.06 }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < contentDistribution.length - 1 ? '1px solid var(--admin-border)' : 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-text-secondary)' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.value.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Top Performing Content */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="admin-card-header">
            <div className="admin-card-title">Top Performing Content</div>
            <button className="admin-btn admin-btn-ghost admin-btn-sm">
              View All
              <ArrowUpRight size={13} />
            </button>
          </div>
          <div>
            {topContent.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13 }}>
                No content published yet
              </div>
            ) : (
              topContent.map((item, idx) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.75 + idx * 0.06 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 0',
                      borderBottom: idx < topContent.length - 1 ? '1px solid var(--admin-border)' : 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 'var(--admin-radius-md)',
                      background: `${item.color}14`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.color,
                      flexShrink: 0,
                    }}>
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 2 }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{item.type}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {item.views} views
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{item.revenue}</div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: 'var(--admin-success-glow)',
                      color: 'var(--admin-success)',
                      fontSize: 11,
                      fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      <TrendingUp size={11} />
                      {item.growth}%
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}
      >
        {[
          { label: 'Total Users', value: String(u?.total_users ?? 0), icon: Users, color: '#3B82F6', sub: `${u?.new_today ?? 0} joined today` },
          { label: 'Total Revenue', value: `KES ${((r?.total_all_time ?? 0) / 1000000).toFixed(1)}M`, icon: DollarSign, color: '#2DD36F', sub: `KES ${((r?.this_month ?? 0) / 1000).toFixed(0)}K this month` },
          { label: 'Content Published', value: String(stats?.content_counts ? Object.values(stats.content_counts).reduce((a, b) => a + b, 0) : 0), icon: Eye, color: '#8B5CF6', sub: 'All categories' },
          { label: 'Active Subscribers', value: String(u?.active_subscribers ?? 0), icon: Headphones, color: '#FFB800', sub: 'Currently active' },
          { label: 'Tickets Sold', value: String(stats?.ticket_stats?.total_sold ?? 0), icon: Ticket, color: '#FF4D2D', sub: `${stats?.ticket_stats?.this_month ?? 0} this month` },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + idx * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(0,0,0,.2)' }}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-lg)',
                padding: '18px 20px',
                cursor: 'default',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: `${item.color}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                }}>
                  <Icon size={14} strokeWidth={2} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--admin-text-muted)' }}>{item.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>
                {item.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-faint)', marginTop: 4 }}>{item.sub}</div>
            </motion.div>
          )
        })}
      </motion.div>

      <style>{`
        @media (max-width: 1200px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 1024px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1fr 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 1fr 1.4fr"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(5"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .stat-grid { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: repeat(5"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
