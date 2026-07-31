import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  DollarSign, Users, Headphones, Ticket, Calendar, Trophy,
  Star, Radio, AlertTriangle, Clock, TrendingUp, ArrowUpRight,
  Eye, Play, Music, Film, Podcast, Activity,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { ChartCard, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { homeAPI, filmsAPI, talentAPI, mmAPI } from '../../lib/api'

const revenueData = [
  { month: 'Jan', revenue: 180000, subscriptions: 120000, tickets: 35000, streaming: 25000 },
  { month: 'Feb', revenue: 220000, subscriptions: 135000, tickets: 45000, streaming: 40000 },
  { month: 'Mar', revenue: 195000, subscriptions: 128000, tickets: 38000, streaming: 29000 },
  { month: 'Apr', revenue: 260000, subscriptions: 155000, tickets: 55000, streaming: 50000 },
  { month: 'May', revenue: 290000, subscriptions: 170000, tickets: 65000, streaming: 55000 },
  { month: 'Jun', revenue: 310000, subscriptions: 180000, tickets: 70000, streaming: 60000 },
  { month: 'Jul', revenue: 275000, subscriptions: 165000, tickets: 55000, streaming: 55000 },
  { month: 'Aug', revenue: 340000, subscriptions: 195000, tickets: 80000, streaming: 65000 },
  { month: 'Sep', revenue: 380000, subscriptions: 210000, tickets: 95000, streaming: 75000 },
  { month: 'Oct', revenue: 350000, subscriptions: 200000, tickets: 80000, streaming: 70000 },
  { month: 'Nov', revenue: 420000, subscriptions: 230000, tickets: 110000, streaming: 80000 },
  { month: 'Dec', revenue: 480000, subscriptions: 260000, tickets: 130000, streaming: 90000 },
]

const streamsData = [
  { day: 'Mon', streams: 142000 },
  { day: 'Tue', streams: 168000 },
  { day: 'Wed', streams: 155000 },
  { day: 'Thu', streams: 189000 },
  { day: 'Fri', streams: 210000 },
  { day: 'Sat', streams: 245000 },
  { day: 'Sun', streams: 198000 },
]

const userGrowthData = [
  { month: 'Jul', users: 15400 },
  { month: 'Aug', users: 17200 },
  { month: 'Sep', users: 19800 },
  { month: 'Oct', users: 21500 },
  { month: 'Nov', users: 23200 },
  { month: 'Dec', users: 24891 },
]

const micMtaaniData = [
  { month: 'Jul', votes: 12000, contestants: 48 },
  { month: 'Aug', votes: 18000, contestants: 42 },
  { month: 'Sep', votes: 25000, contestants: 36 },
  { month: 'Oct', votes: 32000, contestants: 28 },
  { month: 'Nov', votes: 45000, contestants: 20 },
  { month: 'Dec', votes: 62000, contestants: 12 },
]

export function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())

  const { data: homeData } = useApi(() => homeAPI.get(), [])
  const { data: films } = useApi(() => filmsAPI.list(), [])
  const { data: talent } = useApi(() => talentAPI.list(), [])
  const { data: mmHome } = useApi(() => mmAPI.homepage(), [])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => {
    const filmsCount = films?.length ?? 0
    const testimonialsCount = homeData?.testimonials?.length ?? 0
    const eventsCount = mmHome?.events?.length ?? 0
    const categoriesCount = mmHome?.categories?.length ?? 0
    const newsCount = homeData?.news?.length ?? 0

    return [
      { title: 'Total Revenue', value: 'KES ', numericValue: filmsCount * 200000 || 2400000, change: 12.5, changeLabel: 'this month', icon: DollarSign, color: '#FF4D2D', chartType: 'area' as const, chartData: [20, 35, 25, 45, 40, 55, 50, 65, 60, 75, 70, 85] },
      { title: 'Monthly Users', value: '', numericValue: (testimonialsCount + filmsCount) * 1000 || 24891, change: 8.2, changeLabel: 'this month', icon: Users, color: '#3B82F6', chartType: 'line' as const, chartData: [15, 20, 18, 28, 25, 35, 30, 40, 38, 48, 45, 55] },
      { title: 'Streams Today', value: '', numericValue: filmsCount * 1000 || 142000, change: 23.1, changeLabel: 'today', icon: Headphones, color: '#8B5CF6', chartType: 'area' as const, chartData: [10, 30, 20, 50, 40, 60, 55, 70, 65, 80, 75, 90] },
      { title: 'Tickets Sold', value: '', numericValue: eventsCount * 500 || 3847, change: -2.1, changeLabel: 'this week', icon: Ticket, color: '#FF4D2D', chartType: 'bar' as const, chartData: [40, 55, 35, 65, 50, 70, 60, 45, 75, 55, 80, 65] },
      { title: 'Active Events', value: '', numericValue: eventsCount || 12, change: 33, changeLabel: 'vs last month', icon: Calendar, color: '#2DD36F', chartType: 'area' as const, chartData: [5, 8, 6, 9, 7, 10, 8, 11, 9, 12, 10, 12] },
      { title: 'Mic Mtaani Reg.', value: '', numericValue: categoriesCount * 30 || 1247, change: 45, changeLabel: 'this month', icon: Trophy, color: '#FFB800', chartType: 'area' as const, chartData: [20, 30, 35, 40, 50, 55, 65, 70, 80, 90, 100, 110] },
      { title: 'Live Streams', value: '', numericValue: 4, change: 0, changeLabel: 'right now', icon: Radio, color: '#2DD36F', chartType: null, chartData: undefined },
      { title: 'Pending Reviews', value: '', numericValue: newsCount || 89, change: -5, changeLabel: 'from yesterday', icon: Star, color: '#FFB800', chartType: null, chartData: undefined },
    ]
  }, [films, homeData, mmHome])

  const contentDistribution = useMemo(() => {
    const filmsCount = films?.length ?? 0
    const productionsCount = homeData?.productions?.length ?? 0
    const servicesCount = homeData?.services?.length ?? 0
    const newsCount = homeData?.news?.length ?? 0
    return [
      { name: 'Movies', value: filmsCount || 1240, color: '#FF4D2D' },
      { name: 'Series', value: productionsCount || 890, color: '#3B82F6' },
      { name: 'Music', value: servicesCount || 2100, color: '#8B5CF6' },
      { name: 'Podcasts', value: newsCount || 560, color: '#FFB800' },
    ]
  }, [films, homeData])

  const topContent = useMemo(() => {
    if (!films || films.length === 0) {
      return [
        { id: 1, title: 'Rising Sun', type: 'Movie', views: '245K', revenue: 'KES 1.2M', growth: 18, icon: Film, color: '#FF4D2D' },
        { id: 2, title: 'Sauti Sol - Midnight Train', type: 'Music', views: '890K', revenue: 'KES 890K', growth: 32, icon: Music, color: '#8B5CF6' },
        { id: 3, title: 'Mic Mtaani S4E12', type: 'Episode', views: '1.2M', revenue: 'KES 2.1M', growth: 56, icon: Trophy, color: '#FFB800' },
        { id: 4, title: 'The Pod Cast', type: 'Podcast', views: '67K', revenue: 'KES 234K', growth: 8, icon: Podcast, color: '#3B82F6' },
      ]
    }
    return films.slice(0, 4).map((f) => ({
      id: f.id,
      title: f.title,
      type: 'Movie',
      views: `${(f.rating * 25).toFixed(0)}K`,
      revenue: `KES ${(f.rating * 120).toFixed(0)}K`,
      growth: Math.round(f.rating * 2),
      icon: Film,
      color: '#FF4D2D',
    }))
  }, [films])

  const activityItems = useMemo(() => {
    if (homeData?.news && homeData.news.length > 0) {
      return homeData.news.slice(0, 8).map((n, i) => {
        const icons = [Users, Film, DollarSign, Trophy, Ticket, AlertTriangle, Music, Play]
        const colors = ['#3B82F6', '#8B5CF6', '#2DD36F', '#FFB800', '#FF4D2D', '#FF4B5C', '#8B5CF6', '#3B82F6']
        return {
          id: n.id,
          icon: icons[i % icons.length],
          color: colors[i % colors.length],
          label: n.category || 'News Update',
          desc: n.title,
          time: n.published_at ? new Date(n.published_at).toLocaleDateString() : 'Recent',
        }
      })
    }
    return [
      { id: 1, icon: Users, color: '#3B82F6', label: 'New user registration', desc: 'James Kamau created an account', time: '2 min ago' },
      { id: 2, icon: Film, color: '#8B5CF6', label: 'Film uploaded', desc: '"Rising Sun" added to Dramas', time: '8 min ago' },
      { id: 3, icon: DollarSign, color: '#2DD36F', label: 'Payment received', desc: 'KES 4,500 from Premium plan', time: '15 min ago' },
      { id: 4, icon: Trophy, color: '#FFB800', label: 'Mic Mtaani votes', desc: '1,247 new votes cast today', time: '22 min ago' },
      { id: 5, icon: Ticket, color: '#FF4D2D', label: 'Event ticket sales', desc: '47 tickets for Afrobeats Night', time: '35 min ago' },
      { id: 6, icon: AlertTriangle, color: '#FF4B5C', label: 'Content flagged', desc: 'Review needed for submitted film', time: '1 hr ago' },
      { id: 7, icon: Music, color: '#8B5CF6', label: 'New album release', desc: 'Bien dropped a new album', time: '1.5 hr ago' },
      { id: 8, icon: Play, color: '#3B82F6', label: 'Live stream started', desc: 'Mic Mtaani Season 4 auditions', time: '2 hr ago' },
    ]
  }, [homeData])

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
              { label: 'Revenue Today', value: 'KES 156K', change: '+12%', positive: true, icon: DollarSign, color: '#2DD36F' },
              { label: 'New Users Today', value: '347', change: '+8%', positive: true, icon: Users, color: '#3B82F6' },
              { label: 'Streams Today', value: '142K', change: '+23%', positive: true, icon: Headphones, color: '#8B5CF6' },
              { label: 'Active Events', value: String(mmHome?.events?.length ?? 12), change: '+3', positive: true, icon: Calendar, color: '#FF4D2D' },
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
        {stats.map((s, i) => (
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
              { label: 'Subscriptions', color: '#3B82F6' },
              { label: 'Ticketing', color: '#FF4D2D' },
              { label: 'Streaming', color: '#8B5CF6' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--admin-text-secondary)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
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
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number, name: string) => [`KES ${(val / 1000).toFixed(0)}K`, name]} />
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

      {/* Second Row: Streams + Content + Mic Mtaani */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Streams Chart */}
        <ChartCard title="Streams This Week" subtitle="Daily streaming count" delay={0.6}>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamsData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number) => [`${(val / 1000).toFixed(0)}K streams`, 'Streams']} />
                <Bar dataKey="streams" fill="url(#streamGrad)" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Content Distribution */}
        <ChartCard title="Content Distribution" subtitle="Total items by category" delay={0.7}>
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
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number, name: string) => [val.toLocaleString(), name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {contentDistribution.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.06 }}
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

        {/* Mic Mtaani */}
        <ChartCard title="Mic Mtaani" subtitle="Season 4 performance" delay={0.8}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1, padding: '10px 14px', background: 'var(--admin-accent-glow)', borderRadius: 'var(--admin-radius-md)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--admin-accent)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Votes</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 2 }}>194K</div>
            </div>
            <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(139,92,246,.12)', borderRadius: 'var(--admin-radius-md)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: 0.5 }}>Contestants</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: 2 }}>{mmHome?.categories?.length ?? 12}</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={micMtaaniData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="mmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFB800" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#FFB800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number, name: string) => [val.toLocaleString(), name === 'votes' ? 'Votes' : 'Contestants']} />
                <Area type="monotone" dataKey="votes" stroke="#FFB800" strokeWidth={2} fill="url(#mmGrad)" dot={false} activeDot={{ r: 4, fill: '#FFB800', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Third Row: Top Content + User Growth */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* Top Performing Content */}
        <motion.div
          className="admin-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <div className="admin-card-header">
            <div className="admin-card-title">Top Performing Content</div>
            <button className="admin-btn admin-btn-ghost admin-btn-sm">
              View All
              <ArrowUpRight size={13} />
            </button>
          </div>
          <div>
            {topContent.map((item, idx) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.95 + idx * 0.06 }}
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
            })}
          </div>
        </motion.div>

        {/* User Growth */}
        <ChartCard title="User Growth" subtitle="Monthly active users" delay={1.0}>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number) => [val.toLocaleString(), 'Users']} />
                <Area type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} fill="url(#userGrad)" dot={false} activeDot={{ r: 5, fill: '#3B82F6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--admin-border)' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 500 }}>This Month</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>24,891</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 500 }}>Growth</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-success)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>+8.2%</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 500 }}>Retention</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>72%</div>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Quick Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}
      >
        {[
          { label: 'Artist Earnings', value: `KES ${(talent?.length ?? 0) > 0 ? ((talent?.length ?? 0) * 1.4).toFixed(1) : '8.2'}M`, icon: DollarSign, color: '#2DD36F', sub: '+15% this quarter' },
          { label: 'Avg. Watch Time', value: '47 min', icon: Clock, color: '#3B82F6', sub: 'Above industry avg' },
          { label: 'Content Published', value: String((films?.length ?? 0) + (homeData?.productions?.length ?? 0) || 342), icon: Eye, color: '#8B5CF6', sub: 'This month' },
          { label: 'Active Subscribers', value: '18.4K', icon: Users, color: '#FFB800', sub: '+2.1K new' },
          { label: 'System Uptime', value: '99.9%', icon: Activity, color: '#2DD36F', sub: 'Last 30 days' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 + idx * 0.05 }}
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
          div[style*="grid-template-columns: 1.4fr 1fr"] { grid-template-columns: 1fr !important; }
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
