import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight,
  Download, Filter, RefreshCcw, Smartphone, Globe, Banknote,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { ChartCard, ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { filmsAPI, adminAPI, type Film, type Contact } from '../../lib/api'

const revenueByMethod = [
  { method: 'M-Pesa', amount: 8200000, pct: 42, color: '#2DD36F' },
  { method: 'Stripe', amount: 5400000, pct: 28, color: '#3B82F6' },
  { method: 'PayPal', amount: 2800000, pct: 14, color: '#8B5CF6' },
  { method: 'Visa/MC', amount: 2100000, pct: 11, color: '#FFB800' },
  { method: 'Flutterwave', amount: 980000, pct: 5, color: '#FF4D2D' },
]

const dailyRevenue = [
  { day: 'Mon', revenue: 45000, refunds: 1200 },
  { day: 'Tue', revenue: 52000, refunds: 800 },
  { day: 'Wed', revenue: 48000, refunds: 1500 },
  { day: 'Thu', revenue: 61000, refunds: 900 },
  { day: 'Fri', revenue: 72000, refunds: 1100 },
  { day: 'Sat', revenue: 85000, refunds: 600 },
  { day: 'Sun', revenue: 68000, refunds: 400 },
]

const statusColors: Record<string, { bg: string; color: string }> = {
  Success: { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  Pending: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
  Refunded: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
}

function contactToPayment(c: Contact) {
  return {
    id: c.id,
    user: c.name,
    amount: 'KES 499',
    method: 'M-Pesa',
    type: c.service || 'Subscription',
    status: c.status === 'replied' ? 'Success' as const : c.status === 'read' ? 'Pending' as const : 'Pending' as const,
    date: c.created_at,
  }
}

export function PaymentsPage() {
  const { token } = useAuth()
  const { data: films } = useApi<Film[]>(() => filmsAPI.list(), [])
  const { data: contacts } = useApi<Contact[]>(
    () => adminAPI.contacts(token!),
    [token]
  )

  const recentPayments = (contacts ?? []).slice(0, 6).map(contactToPayment)

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Track all transactions and revenue streams"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-secondary"><RefreshCcw size={15} /> Sync</button>
            <button className="admin-btn admin-btn-secondary"><Download size={15} /> Export</button>
          </div>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { title: 'Total Revenue', value: 'KES ', numericValue: 19500000, change: 15, icon: DollarSign, color: '#2DD36F', chartData: [120, 135, 128, 148, 155, 168, 180, 175, 190, 195, 188, 195] },
          { title: 'Today\'s Revenue', value: 'KES ', numericValue: 156000, change: 12, icon: TrendingUp, color: '#FF4D2D', chartData: [45, 52, 48, 61, 72, 85, 68] },
          { title: 'Pending Payouts', value: 'KES ', numericValue: 420000, change: -8, icon: CreditCard, color: '#FFB800', chartData: [60, 55, 48, 52, 45, 42, 42] },
          { title: 'Refund Rate', value: '', numericValue: 2.3, suffix: '%', change: -0.4, icon: ArrowDownRight, color: '#8B5CF6', chartData: [3.8, 3.2, 3.0, 2.8, 2.5, 2.4, 2.3] },
        ].map((s, i) => (
          <StatCard key={s.title} title={s.title} value={s.value} numericValue={s.numericValue} change={s.change} icon={<s.icon size={20} strokeWidth={2} />} color={s.color} chartData={s.chartData} delay={i * 0.05} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 28 }}>
        <ChartCard title="Daily Revenue" subtitle="Revenue vs refunds this week" delay={0.3}>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRevenue} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: number, name: string) => [`KES ${(val / 1000).toFixed(1)}K`, name === 'revenue' ? 'Revenue' : 'Refunds']} />
                <Bar dataKey="revenue" fill="#2DD36F" radius={[4, 4, 0, 0]} barSize={28} name="revenue" />
                <Bar dataKey="refunds" fill="#FF4B5C" radius={[4, 4, 0, 0]} barSize={28} name="refunds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Payment Methods */}
        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="admin-card-header">
            <div className="admin-card-title">Revenue by Method</div>
          </div>
          <div>
            {revenueByMethod.map((m, idx) => (
              <div key={m.method} style={{ padding: '12px 0', borderBottom: idx < revenueByMethod.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: m.color }} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--admin-text-secondary)' }}>{m.method}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-text)' }}>KES {(m.amount / 1000000).toFixed(1)}M</span>
                    <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{m.pct}%</span>
                  </div>
                </div>
                <div className="admin-progress">
                  <div className="admin-progress-bar" style={{ width: `${m.pct}%`, background: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Payments */}
      <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Recent Transactions {films ? `(${films.length} films)` : ''}</div>
          <button className="admin-btn admin-btn-ghost admin-btn-sm">View All</button>
        </div>
        <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Type</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p, idx) => {
                const sc = statusColors[p.status]
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + idx * 0.04 }}>
                    <td className="cell-primary">{p.user}</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>{p.amount}</td>
                    <td>{p.method}</td>
                    <td>{p.type}</td>
                    <td><span className="badge" style={{ background: sc.bg, color: sc.color }}><span className="badge-dot" />{p.status}</span></td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>{p.date}</td>
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
