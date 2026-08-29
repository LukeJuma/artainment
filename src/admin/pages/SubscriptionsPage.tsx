import { motion } from 'framer-motion'
import {
  CreditCard, TrendingUp, Users, DollarSign,
  Crown, Star, Heart, GraduationCap, Calendar, MoreHorizontal, Edit3, Plus,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { ChartCard, ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, chartTooltipStyle } from '../components/ChartCard'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type Subscription, type SubscriptionPlan } from '../../lib/api'

const subGrowthData = [
  { month: 'Jul', total: 8300, new: 1200, churned: 340 },
  { month: 'Aug', total: 9100, new: 1400, churned: 300 },
  { month: 'Sep', total: 10200, new: 1600, churned: 280 },
  { month: 'Oct', total: 11500, new: 1800, churned: 260 },
  { month: 'Nov', total: 13200, new: 2100, churned: 240 },
  { month: 'Dec', total: 13900, new: 2400, churned: 220 },
]

const planMeta: Record<string, { icon: typeof Crown; color: string }> = {
  premium: { icon: Crown, color: '#FF4D2D' },
  vip: { icon: Star, color: '#FFB800' },
  family: { icon: Heart, color: '#8B5CF6' },
  student: { icon: GraduationCap, color: '#2DD36F' },
}

const defaultMeta = { icon: Crown, color: '#3B82F6' }

function formatDate(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function SubscriptionsPage() {
  const { token } = useAuth()
  const { data: plans, loading: loadingPlans } = useApi<SubscriptionPlan[]>(
    () => adminAPI.plans(token!),
    [token]
  )
  const { data: subscriptions, loading: loadingSubs } = useApi<Subscription[]>(
    () => adminAPI.subscriptions(token!),
    [token]
  )

  const loading = loadingPlans || loadingSubs
  const planList = plans ?? []
  const subList = subscriptions ?? []

  const activeSubs = subList.filter((s) => s.status === 'active')
  const monthlyRevenue = activeSubs.reduce((sum, s) => sum + (s.plan?.price ?? 0), 0)

  const plansWithMeta = planList.map((plan) => {
    const meta = planMeta[plan.slug] ?? defaultMeta
    const subscriberCount = subList.filter((s) => s.plan_id === plan.id && s.status === 'active').length
    return {
      ...plan,
      priceLabel: `KES ${plan.price}/${plan.billing_interval}`,
      subscribers: subscriberCount,
      revenue: subscriberCount * plan.price,
      growth: 0,
      meta,
    }
  })

  const recentSubscriptions = subList.slice(0, 5).map((s) => ({
    id: s.id,
    user: s.user?.name ?? `User #${s.user_id}`,
    plan: s.plan?.name ?? 'Unknown',
    method: s.plan ? `KES ${s.plan.price}` : '—',
    amount: s.plan ? `KES ${s.plan.price}` : '—',
    date: formatDate(s.started_at ?? s.ends_at),
    status: s.status === 'active' ? 'Active' : s.status === 'cancelled' ? 'Cancelled' : 'Expired',
  }))

  if (loading) {
    return (
      <div>
        <PageHeader title="Subscriptions" description="Manage subscription plans and recurring revenue" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> New Plan</button>} />
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: 'var(--admin-text-muted)' }}>Loading subscriptions data...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Manage subscription plans and recurring revenue"
        actions={
          <button className="admin-btn admin-btn-primary">
            <Plus size={15} />
            New Plan
          </button>
        }
      />

      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { title: 'Active Subs', value: '', numericValue: activeSubs.length, change: 12, icon: Users, color: '#3B82F6', chartData: [83, 91, 102, 115, 132, 139] },
          { title: 'Monthly Revenue', value: 'KES ', numericValue: monthlyRevenue, change: 15, icon: DollarSign, color: '#2DD36F', chartData: [52, 58, 64, 71, 78, 77] },
          { title: 'Churn Rate', value: '', numericValue: 1.8, suffix: '%', change: -0.3, icon: TrendingUp, color: '#FFB800', chartData: [3.2, 2.8, 2.5, 2.2, 2.0, 1.8] },
          { title: 'Avg. Lifetime', value: '', numericValue: 14, suffix: ' mo', change: 8, icon: Calendar, color: '#8B5CF6', chartData: [10, 11, 11, 12, 13, 14] },
        ].map((s, i) => (
          <StatCard key={s.title} title={s.title} value={s.value} numericValue={s.numericValue} change={s.change} icon={<s.icon size={20} strokeWidth={2} />} color={s.color} chartData={s.chartData} delay={i * 0.05} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {plansWithMeta.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ gridColumn: '1 / -1', padding: 48, textAlign: 'center', color: 'var(--admin-text-muted)', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)' }}
          >
            No subscription plans yet
          </motion.div>
        ) : plansWithMeta.map((plan, idx) => {
          const Icon = plan.meta.icon
          const color = plan.meta.color
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.08 }}
              whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-lg)',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: color,
              }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 'var(--admin-radius-md)',
                  background: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                }}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}><Edit3 size={13} /></button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}><MoreHorizontal size={13} /></button>
                </div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 4 }}>{plan.priceLabel}</div>
              <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 16 }}>{plan.subscribers} subscriber{plan.subscribers === 1 ? '' : 's'}</div>
              <div style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 12 }}>
                {(plan.features ?? []).map(f => (
                  <div key={f} style={{ fontSize: 12, color: 'var(--admin-text-secondary)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 4, height: 4, borderRadius: 2, background: color, flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
                {(plan.features ?? []).length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>No features listed</div>
                )}
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--admin-border)' }}>
                <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>Revenue</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-success)' }}>KES {plan.revenue.toLocaleString()}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
        <ChartCard title="Subscription Growth" subtitle="Net new subscriptions" delay={0.6}>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subGrowthData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="new" fill="#2DD36F" radius={[4, 4, 0, 0]} barSize={20} name="New" />
                <Bar dataKey="churned" fill="#FF4B5C" radius={[4, 4, 0, 0]} barSize={20} name="Churned" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <motion.div className="admin-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <div className="admin-card-header">
            <div className="admin-card-title">Recent Subscriptions</div>
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {recentSubscriptions.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13 }}>No subscriptions yet</div>
            ) : recentSubscriptions.map((t) => (
              <div key={t.id} className="activity-item" style={{ padding: '10px 0' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 'var(--admin-radius-md)',
                  background: 'rgba(255,255,255,.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--admin-text-secondary)',
                  flexShrink: 0,
                }}>
                  <CreditCard size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{t.user}</div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{t.plan} · {t.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--admin-success)' }}>{t.amount}</div>
                  <div style={{ fontSize: 10, color: t.status === 'Active' ? 'var(--admin-success)' : t.status === 'Cancelled' ? 'var(--admin-accent)' : 'var(--admin-text-muted)' }}>{t.status}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
          div[style*="grid-template-columns: 1.5fr 1fr"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          div[style*="grid-template-columns: repeat(4, 1fr)"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
