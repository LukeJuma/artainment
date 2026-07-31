import { motion } from 'framer-motion'
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { NAV_SECTIONS } from '../lib/navigation'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <motion.aside
      className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="admin-sidebar-logo" onClick={onToggleCollapse}>
        <div className="logo-icon">
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1 }}>A</span>
        </div>
        <motion.span
          className="logo-text"
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
          transition={{ duration: 0.2 }}
        >
          Artainment+
        </motion.span>
        {!collapsed && (
          <motion.div
            className="sidebar-toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ marginLeft: 'auto' }}
          >
            <ChevronLeft size={14} />
          </motion.div>
        )}
        {collapsed && (
          <motion.div
            className="sidebar-toggle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 50 }}
          >
            <ChevronRight size={13} />
          </motion.div>
        )}
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <motion.div
              className="nav-section-title"
              animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : 'auto' }}
              transition={{ duration: 0.2 }}
            >
              {section.title}
            </motion.div>
            {section.items.map((item) => {
              const isActive = currentPage === item.id
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`nav-item${isActive ? ' active' : ''}`}
                  style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
                  role="menuitem"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(item.id) } }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3,
                        height: 22,
                        background: 'var(--admin-primary)',
                        borderRadius: '0 3px 3px 0',
                      }}
                    />
                  )}
                  <Icon size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                  <motion.span
                    className="nav-label"
                    animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {item.label}
                  </motion.span>
                  {!collapsed && item.badge != null && (
                    <span
                      className={`nav-badge${item.badgeType === 'warning' ? ' warning' : item.badgeType === 'success' ? ' success' : ''}${item.badge === 'LIVE' ? ' live' : ''}`}
                      style={{ marginLeft: 'auto' }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div
          onClick={() => onNavigate('logout')}
          className="nav-item"
          style={{
            color: 'var(--admin-danger)',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--admin-danger-glow)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <LogOut size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <motion.span
            className="nav-label"
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            Logout
          </motion.span>
        </div>
      </div>
    </motion.aside>
  )
}
