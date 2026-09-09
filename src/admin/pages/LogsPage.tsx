import { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, AlertTriangle, Info, AlertCircle, RefreshCcw, Download, Filter } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../lib/api'

const levelConfig: Record<string, { bg: string; color: string; icon: typeof Info }> = {
  INFO: { bg: 'var(--admin-info-glow)', color: 'var(--admin-info)', icon: Info },
  WARN: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)', icon: AlertTriangle },
  ERROR: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', icon: AlertCircle },
}

export function LogsPage() {
  const { token } = useAuth()
  const [filter, setFilter] = useState<{ level?: string; action?: string }>({})
  const [refreshKey, setRefreshKey] = useState(0)
  
  const { data: auditLogs, loading } = useApi(() => 
    adminAPI.getAuditLogs(token!, { per_page: 100, ...filter }), 
    [token, filter, refreshKey]
  )
  
  const { data: stats } = useApi(() => 
    adminAPI.getAuditStats(token!), 
    [token, refreshKey]
  )

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  if (loading && !auditLogs) {
    return (
      <div className="admin-container">
        <PageHeader title="System Logs" />
        <div className="loading-spinner">Loading audit logs...</div>
      </div>
    )
  }

  const logs = auditLogs?.data || []
  const logStats = stats?.stats || { total_logs: 0, logs_today: 0, error_logs_today: 0, unique_users_today: 0 }

  return (
    <div className="admin-container">
      <PageHeader 
        title="System Logs" 
        description="Monitor system activity and security events"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              className="admin-btn admin-btn-secondary" 
              onClick={handleRefresh}
            >
              <RefreshCcw size={15} /> Refresh
            </button>
            <button className="admin-btn admin-btn-secondary">
              <Download size={15} /> Export
            </button>
          </div>
        } 
      />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="admin-card">
          <div className="admin-card-body" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#3B82F6', fontSize: 32, fontWeight: 700, margin: 0 }}>
              {logStats.total_logs.toLocaleString()}
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Total Logs</p>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-body" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#2DD36F', fontSize: 32, fontWeight: 700, margin: 0 }}>
              {logStats.logs_today.toLocaleString()}
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Today</p>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-body" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#FF4D2D', fontSize: 32, fontWeight: 700, margin: 0 }}>
              {logStats.error_logs_today.toLocaleString()}
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Errors Today</p>
          </div>
        </div>
        
        <div className="admin-card">
          <div className="admin-card-body" style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#8B5CF6', fontSize: 32, fontWeight: 700, margin: 0 }}>
              {logStats.unique_users_today.toLocaleString()}
            </h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Active Users</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Audit Trail</h3>
            <p className="admin-card-subtitle">Real-time security and activity monitoring</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <select 
              value={filter.level || ''} 
              onChange={e => setFilter(prev => ({ ...prev, level: e.target.value || undefined }))}
              className="admin-select-sm"
            >
              <option value="">All Levels</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warning</option>
              <option value="ERROR">Error</option>
            </select>
            <Filter size={16} />
          </div>
        </div>
        
        <div className="admin-card-body" style={{ padding: 0 }}>
          {logs.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
              <Terminal size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div style={{ maxHeight: 600, overflowY: 'auto' }}>
              {logs.map(log => {
                const config = levelConfig[log.level] || levelConfig.INFO
                const Icon = config.icon
                
                return (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '16px 20px',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: config.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      <Icon size={16} style={{ color: config.color }} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: 14,
                          color: '#fff'
                        }}>
                          {log.message}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          background: config.bg,
                          color: config.color,
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 500,
                          textTransform: 'uppercase',
                        }}>
                          {log.level}
                        </span>
                      </div>
                      
                      <div style={{ 
                        fontSize: 12, 
                        color: 'rgba(255,255,255,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}>
                        <span>{log.time_ago}</span>
                        {log.user && (
                          <span>by {log.user.name}</span>
                        )}
                        {log.ip_address && (
                          <span>from {log.ip_address}</span>
                        )}
                        {log.resource_type && (
                          <span className="mono">{log.resource_type}#{log.resource_id}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {stats?.recent_actions && stats.recent_actions.length > 0 && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Most Frequent Actions (Last 7 Days)</h3>
          </div>
          <div className="admin-card-body">
            <div style={{ display: 'grid', gap: 8 }}>
              {stats.recent_actions.map((action, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 8,
                }}>
                  <span className="mono" style={{ fontSize: 13 }}>{action.action}</span>
                  <span style={{ 
                    background: 'var(--admin-info-glow)', 
                    color: 'var(--admin-info)',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                    {action.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}