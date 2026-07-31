import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Flag, Eye, Ban, Check, X, Search, MessageSquare, Clock } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type MMComment, type MMPaginated } from '../../lib/api'

interface Report {
  id: number
  type: string
  content: string
  reporter: string
  severity: string
  status: string
  date: string
}

function commentToReport(c: MMComment): Report {
  return {
    id: c.id,
    type: 'Comment',
    content: c.body,
    reporter: c.name,
    severity: 'Low',
    status: 'Pending',
    date: c.created_at,
  }
}

const severityColors: Record<string, { bg: string; color: string }> = {
  High: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
  Medium: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
  Low: { bg: 'rgba(255,255,255,.06)', color: 'var(--admin-text-secondary)' },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Pending: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
  Reviewed: { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  Escalated: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
}

export function ModerationPage() {
  const { token } = useAuth()
  const { data: commentsPage, loading, refetch } = useApi<MMPaginated<MMComment>>(
    () => adminAPI.mmPendingComments(token!),
    [token]
  )

  const [search, setSearch] = useState('')

  const reports: Report[] = (commentsPage?.data ?? []).map(commentToReport)

  const filtered = reports.filter(r => r.content.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase()))

  const handleApprove = async (id: number) => {
    if (!token) return
    await adminAPI.mmApproveComment(token, id)
    refetch()
  }

  const handleReject = async (id: number) => {
    if (!token) return
    await adminAPI.mmDeleteComment(token, id)
    refetch()
  }

  return (
    <div>
      <PageHeader title="Moderation" description="Review flagged content and community reports" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Pending Review', value: String(commentsPage?.total ?? reports.length), icon: Clock, color: '#FFB800' },
          { label: 'High Severity', value: '3', icon: AlertTriangle, color: '#FF4B5C' },
          { label: 'Resolved Today', value: '28', icon: Check, color: '#2DD36F' },
          { label: 'Blocked Users', value: '5', icon: Ban, color: '#6B7280' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}><Icon size={15} strokeWidth={2} /></div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 500, marginTop: 2 }}>{item.label}</div>
            </motion.div>
          )
        })}
      </div>
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search reports..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Type</th><th>Content</th><th>Reporter</th><th>Severity</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const sev = severityColors[r.severity]
                const sc = statusColors[r.status]
                return (
                  <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                    <td><span className="badge badge-neutral">{r.type}</span></td>
                    <td className="cell-primary" style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.content}</td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{r.reporter}</td>
                    <td><span className="badge" style={{ background: sev.bg, color: sev.color }}>{r.severity}</span></td>
                    <td><span className="badge" style={{ background: sc.bg, color: sc.color }}><span className="badge-dot" />{r.status}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{r.date}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}><Eye size={13} /></button>
                        <button className="admin-btn admin-btn-success admin-btn-sm" style={{ padding: 5 }} onClick={() => handleApprove(r.id)}><Check size={13} /></button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" style={{ padding: 5 }} onClick={() => handleReject(r.id)}><X size={13} /></button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
