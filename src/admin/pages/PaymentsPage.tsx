import { motion } from 'framer-motion'
import {
  DollarSign, TrendingUp, CreditCard, ArrowDownRight,
  Download, RefreshCcw,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { ChartCard, ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type Payment } from '../../lib/api'

const methodColors: Record<string, string> = {
  mpesa: '#2DD36F',
  stripe: '#3B82F6',
  paypal: '#8B5CF6',
  card: '#FFB800',
  flutterwave: '#FF4D2D',
}

const fallbackDailyRevenue = [
  { day: 'Mon', revenue: 45000, refunds: 1200 },
  { day: 'Tue', revenue: 52000, refunds: 800 },
  { day: 'Wed', revenue: 48000, refunds: 1500 },
  { day: 'Thu', revenue: 61000, refunds: 900 },
  { day: 'Fri', revenue: 72000, refunds: 1100 },
  { day: 'Sat', revenue: 85000, refunds: 600 },
  { day: 'Sun', revenue: 68000, refunds: 400 },
]

const statusColors: Record<string, { bg: string; color: string }> = {
  success: { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  pending: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
  refunded: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
  failed: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
}

function methodLabel(method: string): string {
  const labels: Record<string, string> = {
    mpesa: 'M-Pesa',
    stripe: 'Stripe',
    paypal: 'PayPal',
    card: 'Visa/MC',
    flutterwave: 'Flutterwave',
  }
  return labels[method] ?? method.charAt(0).toUpperCase() + method.slice(1)
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function buildDailyRevenue(payments: Payment[]) {
  if (!payments.length) return fallbackDailyRevenue

  const byDay: Record<string, { revenue: number; refunds: number }> = {}
  payments.forEach((p) => {
    const d = new Date(p.paid_at ?? p.created_at ?? '')
    const key = isNaN(d.getTime()) ? 'unknown' : d.toISOString().slice(0, 10)
    if (!byDay[key]) byDay[key] = { revenue: 0, refunds: 0 }
    if (p.status === 'success') byDay[key].revenue += p.amount
    if (p.status === 'refunded') byDay[key].refunds += p.amount
  })

  return Object.keys(byDay)
    .sort()
    .slice(-7)
    .map((key) => ({
      day: new Date(`${key}T00:00:00`).toLocaleDateString('en', { weekday: 'short' }),
      revenue: byDay[key].revenue,
      refunds: byDay[key].refunds,
    }))
}

function buildMethodBreakdown(payments: Payment[]) {
  const byMethod: Record<string, number> = {}
  payments.forEach((p) => {
    const method = p.method || 'other'
    byMethod[method] = (byMethod[method] ?? 0) + p.amount
  })

  const total = payments.reduce((sum, p) => sum + p.amount, 0)
  return Object.entries(byMethod)
    .map(([method, amount]) => ({
      method: methodLabel(method),
      amount,
      pct: total ? Math.round((amount / total) * 100) : 0,
      color: methodColors[method] ?? '#3B82F6',
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function PaymentsPage() {
  const { token } = useAuth()
  const { data: payments } = useApi<Payment[]>(
    () => adminAPI.payments(token!),
    [token]
  )

  const list = payments ?? []
  const totalRevenue = list.reduce((sum, p) => sum + p.amount, 0)
  const today = new Date().toDateString()
  const todayRevenue = list
    .filter((p) => p.status === 'success' && p.paid_at && new Date(p.paid_at).toDateString() === today)
    .reduce((sum, p) => sum + p.amount, 0)
  const pendingPayouts = list
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0)
  const refundedTotal = list
    .filter((p) => p.status === 'refunded')
    .reduce((sum, p) => sum + p.amount, 0)
  const refundRate = totalRevenue ? Math.round((refundedTotal / totalRevenue) * 1000) / 10 : 2.3

  const dailyRevenue = buildDailyRevenue(list)
  const methodBreakdown = buildMethodBreakdown(list)

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
          { title: 'Total Revenue', value: 'KES ', numericValue: totalRevenue, change: 15, icon: DollarSign, color: '#2DD36F', chartData: [120, 135, 128, 148, 155, 168, 180, 175, 190, 195, 188, 195] },
          { title: 'Today\'s Revenue', value: 'KES ', numericValue: todayRevenue, change: 12, icon: TrendingUp, color: '#FF4D2D', chartData: [45, 52, 48, 61, 72, 85, 68] },
          { title: 'Pending Payouts', value: 'KES ', numericValue: pendingPayouts, change: -8, icon: CreditCard, color: '#FFB800', chartData: [60, 55, 48, 52, 45, 42, 42] },
          { title: 'Refund Rate', value: '', numericValue: refundRate, suffix: '%', change: -0.4, icon: ArrowDownRight, color: '#8B5CF6', chartData: [3.8, 3.2, 3.0, 2.8, 2.5, 2.4, 2.3] },
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
                <Tooltip contentStyle={chartTooltipStyle} formatter={(val: unknown, name?: unknown) => [`KES ${(Number(val) / 1000).toFixed(1)}K`, name === 'revenue' ? 'Revenue' : 'Refunds']} />
                <Bar dataKey="revenue" fill="#2DD36F" radius={[4, 4, 0, 0]} barSize={28} name="revenue" />
                <Bar dataKey="refunds" fill="#FF4B5C" radius={[4, 4, 0, 0]} barSize={28} name="refunds" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="admin-card-header">
            <div className="admin-card-title">Revenue by Method</div>
          </div>
          <div>
            {methodBreakdown.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13 }}>No payment data yet</div>
            ) : methodBreakdown.map((m, idx) => (
              <div key={m.method} style={{ padding: '12px 0', borderBottom: idx < methodBreakdown.length - 1 ? '1px solid var(--admin-border)' : 'none' }}>
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

      <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <div className="admin-card-header">
          <div className="admin-card-title">Recent Transactions {list.length ? `(${list.length})` : ''}</div>
          <button className="admin-btn admin-btn-ghost admin-btn-sm">View All</button>
        </div>
        <div className="admin-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--admin-text-muted)' }}>No transactions yet</td></tr>
              ) : list.map((p, idx) => {
                const sc = statusColors[p.status] ?? statusColors.pending
                return (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 + idx * 0.04 }}>
                    <td className="cell-primary">{p.user?.name ?? 'Guest'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--admin-text)' }}>KES {p.amount.toLocaleString()}</td>
                    <td>{methodLabel(p.method)}</td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>{p.reference ?? '—'}</td>
                    <td><span className="badge" style={{ background: sc.bg, color: sc.color }}><span className="badge-dot" />{statusLabel(p.status)}</span></td>
                    <td style={{ color: 'var(--admin-text-muted)' }}>{formatDate(p.paid_at ?? p.created_at)}</td>
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
