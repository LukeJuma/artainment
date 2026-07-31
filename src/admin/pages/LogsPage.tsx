import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Terminal, AlertTriangle, Info, AlertCircle, RefreshCcw, Download, Search, Filter } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { filmsAPI, talentAPI, newsAPI } from '../../lib/api'

const levelConfig: Record<string, { bg: string; color: string; icon: typeof Info }> = {
  INFO: { bg: 'var(--admin-info-glow)', color: 'var(--admin-info)', icon: Info },
  WARN: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)', icon: AlertTriangle },
  ERROR: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', icon: AlertCircle },
}

export function LogsPage() {
  const { data: films } = useApi(() => filmsAPI.list(), [])
  const { data: talent } = useApi(() => talentAPI.list(), [])
  const { data: news } = useApi(() => newsAPI.list(), [])

  const logs = useMemo(() => {
    const entries: { id: number; level: 'INFO' | 'WARN' | 'ERROR'; message: string; source: string; time: string; ip: string }[] = []
    let id = 1
    if (films) {
      films.forEach(f => {
        entries.push({ id: id++, level: 'INFO', message: `Film "${f.title}" loaded successfully`, source: 'content-service', time: 'just now', ip: '—' })
      })
    }
    if (talent) {
      talent.forEach(t => {
        entries.push({ id: id++, level: 'INFO', message: `Talent "${t.name}" loaded successfully`, source: 'content-service', time: 'just now', ip: '—' })
      })
    }
    if (news) {
      news.forEach(n => {
        entries.push({ id: id++, level: 'INFO', message: `News "${n.title}" loaded successfully`, source: 'content-service', time: 'just now', ip: '—' })
      })
    }
    return entries
  }, [films, talent, news])

  return (
    <div>
      <PageHeader title="System Logs" description="Monitor system activity and errors" actions={
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn admin-btn-secondary"><RefreshCcw size={15} /> Refresh</button>
          <button className="admin-btn admin-btn-secondary"><Download size={15} /> Export</button>
        </div>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Logs', value: logs.length.toString(), color: '#3B82F6' },
          { label: 'Warnings', value: logs.filter(l => l.level === 'WARN').length.toString(), color: '#FFB800' },
          { label: 'Errors', value: logs.filter(l => l.level === 'ERROR').length.toString(), color: '#FF4B5C' },
        ].map((item, idx) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}><Terminal size={14} /></div>
            <div><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div><div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{item.label}</div></div>
          </motion.div>
        ))}
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Level</th><th>Message</th><th>Source</th><th>IP</th><th>Time</th></tr></thead>
          <tbody>
            {logs.map((log, idx) => {
              const lc = levelConfig[log.level]
              const Icon = lc.icon
              return (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                  <td><span className="badge" style={{ background: lc.bg, color: lc.color }}><Icon size={10} />{log.level}</span></td>
                  <td style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis' }} className="cell-primary">{log.message}</td>
                  <td><span className="badge badge-neutral">{log.source}</span></td>
                  <td style={{ fontFamily: "'Inter', monospace", fontSize: 12, color: 'var(--admin-text-muted)' }}>{log.ip}</td>
                  <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{log.time}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
