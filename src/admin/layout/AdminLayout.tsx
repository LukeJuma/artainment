import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from '../components/Sidebar'
import { TopNav } from '../components/TopNav'
import { Dashboard } from '../pages/Dashboard'
import { AnalyticsPage } from '../pages/AnalyticsPage'
import { MoviesPage } from '../pages/MoviesPage'
import { SeriesPage } from '../pages/SeriesPage'
import { MusicPage } from '../pages/MusicPage'
import { PodcastsPage } from '../pages/PodcastsPage'
import { EventsPage } from '../pages/EventsPage'
import { TicketingPage } from '../pages/TicketingPage'
import { MicMtaaniPage } from '../pages/MicMtaaniPage'
import { ArtistsPage } from '../pages/ArtistsPage'
import { UsersPage } from '../pages/UsersPage'
import { SubscriptionsPage } from '../pages/SubscriptionsPage'
import { PaymentsPage } from '../pages/PaymentsPage'
import { ReviewsPage } from '../pages/ReviewsPage'
import { ModerationPage } from '../pages/ModerationPage'
import { MarketingPage } from '../pages/MarketingPage'
import { NotificationsPage } from '../pages/NotificationsPage'
import { MessagesPage } from '../pages/MessagesPage'
import { SettingsPage } from '../pages/SettingsPage'
import { LogsPage } from '../pages/LogsPage'
import { AdminsPage } from '../pages/AdminsPage'
import { PAGE_TITLES } from '../lib/navigation'
import '../admin.css'

const PAGES: Record<string, React.FC> = {
  dashboard: Dashboard,
  analytics: AnalyticsPage,
  movies: MoviesPage,
  series: SeriesPage,
  music: MusicPage,
  podcasts: PodcastsPage,
  events: EventsPage,
  ticketing: TicketingPage,
  micmtaani: MicMtaaniPage,
  artists: ArtistsPage,
  users: UsersPage,
  subscriptions: SubscriptionsPage,
  payments: PaymentsPage,
  reviews: ReviewsPage,
  moderation: ModerationPage,
  marketing: MarketingPage,
  notifications: NotificationsPage,
  messages: MessagesPage,
  settings: SettingsPage,
  logs: LogsPage,
  admins: AdminsPage,
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 1024)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export function AdminLayout() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, isAdmin, loading: authLoading } = useAuth()
  const isMobile = useIsMobile()

  const PageComponent = PAGES[currentPage] || Dashboard
  const pageTitle = PAGE_TITLES[currentPage] || 'Dashboard'

  // Close mobile sidebar on navigate
  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    if (isMobile) setMobileOpen(false)
  }

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  if (authLoading) {
    return (
      <div className="admin-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--admin-bg)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ width: 40, height: 40, border: '3px solid var(--admin-border)', borderTopColor: 'var(--admin-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <div style={{ color: 'var(--admin-text-muted)', fontSize: 14 }}>Loading admin panel...</div>
          </motion.div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="admin-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--admin-bg)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: 40, background: 'var(--admin-card)', borderRadius: 'var(--admin-radius-xl)', border: '1px solid var(--admin-border)', maxWidth: 400 }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-danger-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--admin-danger)', fontSize: 24 }}>🔒</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Authentication Required</h2>
            <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 20 }}>Please sign in to access the admin dashboard.</p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => window.location.href = '/login'}
            >
              Sign In
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="admin-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--admin-bg)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', padding: 40, background: 'var(--admin-card)', borderRadius: 'var(--admin-radius-xl)', border: '1px solid var(--admin-border)', maxWidth: 400 }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 'var(--admin-radius-lg)', background: 'var(--admin-danger-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--admin-danger)', fontSize: 24 }}>⛔</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--admin-text)', marginBottom: 8 }}>Access Denied</h2>
            <p style={{ fontSize: 13, color: 'var(--admin-text-muted)', marginBottom: 20 }}>You don't have admin privileges to access this page.</p>
            <button
              className="admin-btn admin-btn-primary"
              onClick={() => window.location.href = '/'}
            >
              Go Home
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-root">
      <div className="admin-layout">
        {/* Desktop sidebar (always rendered for animation, hidden via CSS on mobile) */}
        <div className="admin-sidebar-desktop">
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {isMobile && (
          <AnimatePresence>
            {mobileOpen && (
              <>
                <motion.div
                  className="admin-sidebar-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setMobileOpen(false)}
                />
                <motion.div
                  className="admin-sidebar-mobile"
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                >
                  <Sidebar
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                    collapsed={false}
                    onToggleCollapse={() => setMobileOpen(false)}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        <div className={`admin-main${sidebarCollapsed && !isMobile ? ' sidebar-collapsed' : ''}`}>
          <TopNav
            pageTitle={pageTitle}
            onToggleSidebar={() => {
              if (isMobile) {
                setMobileOpen(prev => !prev)
              } else {
                setSidebarCollapsed(prev => !prev)
              }
            }}
            onNavigate={handleNavigate}
          />
          <div className="admin-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <PageComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
