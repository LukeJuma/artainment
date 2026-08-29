import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ScrollToTop } from './components/ui/ScrollToTop'
import { Nav } from './components/ui/Nav'
import { Footer } from './components/ui/Footer'
import { Loader } from './components/ui/Loader'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import type { Variants } from 'framer-motion'

// Route-level code splitting — each page below loads in its own chunk.
const FilmsPage = lazy(() => import('./pages/FilmsPage').then(m => ({ default: m.FilmsPage })))
const FilmDetailPage = lazy(() => import('./pages/FilmDetailPage').then(m => ({ default: m.FilmDetailPage })))
const SeriesPage = lazy(() => import('./pages/SeriesPage').then(m => ({ default: m.SeriesPage })))
const SeriesDetailPage = lazy(() => import('./pages/SeriesDetailPage').then(m => ({ default: m.SeriesDetailPage })))
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })))
const TalentPage = lazy(() => import('./pages/TalentPage').then(m => ({ default: m.TalentPage })))
const TalentDetailPage = lazy(() => import('./pages/TalentDetailPage').then(m => ({ default: m.TalentDetailPage })))
const PodcastsPage = lazy(() => import('./pages/PodcastsPage').then(m => ({ default: m.PodcastsPage })))
const PodcastDetailPage = lazy(() => import('./pages/PodcastDetailPage').then(m => ({ default: m.PodcastDetailPage })))
const ProductionsPage = lazy(() => import('./pages/ProductionsPage').then(m => ({ default: m.ProductionsPage })))
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const AdminLayout = lazy(() => import('./admin/layout/AdminLayout').then(m => ({ default: m.AdminLayout })))
const MicMtaaniPage = lazy(() => import('./pages/MicMtaaniPage').then(m => ({ default: m.MicMtaaniPage })))
const MicMtaaniArticlePage = lazy(() => import('./pages/MicMtaaniArticlePage').then(m => ({ default: m.MicMtaaniArticlePage })))
const MicMtaaniArticlesPage = lazy(() => import('./pages/MicMtaaniArticlesPage').then(m => ({ default: m.MicMtaaniArticlesPage })))
const MicMtaaniCategoryPage = lazy(() => import('./pages/MicMtaaniCategoryPage').then(m => ({ default: m.MicMtaaniCategoryPage })))
const MicMtaaniEventsPage = lazy(() => import('./pages/MicMtaaniEventsPage').then(m => ({ default: m.MicMtaaniEventsPage })))
const MicMtaaniBusinessesPage = lazy(() => import('./pages/MicMtaaniBusinessesPage').then(m => ({ default: m.MicMtaaniBusinessesPage })))
const MicMtaaniBusinessDetailPage = lazy(() => import('./pages/MicMtaaniBusinessDetailPage').then(m => ({ default: m.MicMtaaniBusinessDetailPage })))
const MicMtaaniSubmitPage = lazy(() => import('./pages/MicMtaaniSubmitPage').then(m => ({ default: m.MicMtaaniSubmitPage })))
const MicMtaaniSearchPage = lazy(() => import('./pages/MicMtaaniSearchPage').then(m => ({ default: m.MicMtaaniSearchPage })))
const MicMtaaniTagPage = lazy(() => import('./pages/MicMtaaniTagPage').then(m => ({ default: m.MicMtaaniTagPage })))

const pageTransition: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial="initial" animate="animate" exit="exit" variants={pageTransition}>
        <Suspense fallback={<Loader />}>
          <Routes location={location}>
            <Route path="/" element={<><Nav /><HomePage /><Footer /></>} />
            <Route path="/films" element={<><Nav /><FilmsPage /><Footer /></>} />
            <Route path="/films/:slug" element={<><Nav overlay /><FilmDetailPage /><Footer /></>} />
            <Route path="/movies" element={<Navigate to="/films" replace />} />
            <Route path="/movies/:slug" element={<FilmRedirect />} />
            <Route path="/series" element={<><Nav /><SeriesPage /><Footer /></>} />
            <Route path="/series/:slug" element={<><Nav overlay /><SeriesDetailPage /><Footer /></>} />
            <Route path="/services" element={<><Nav /><ServicesPage /><Footer /></>} />
            <Route path="/talent" element={<><Nav /><TalentPage /><Footer /></>} />
            <Route path="/talent/:slug" element={<><Nav /><TalentDetailPage /><Footer /></>} />
            <Route path="/actors" element={<Navigate to="/talent" replace />} />
            <Route path="/actors/:slug" element={<TalentRedirect />} />
            <Route path="/podcasts" element={<><Nav /><PodcastsPage /><Footer /></>} />
            <Route path="/podcasts/:slug" element={<><Nav /><PodcastDetailPage /><Footer /></>} />
            <Route path="/productions" element={<><Nav /><ProductionsPage /><Footer /></>} />
            <Route path="/about" element={<><Nav /><AboutPage /><Footer /></>} />
            <Route path="/contact" element={<><Nav /><ContactPage /><Footer /></>} />
            <Route path="/login" element={<><Nav /><LoginPage /><Footer /></>} />
            <Route path="/register" element={<><Nav /><RegisterPage /><Footer /></>} />
            <Route path="/forgot-password" element={<><Nav /><ForgotPasswordPage /><Footer /></>} />
            <Route path="/reset-password" element={<><Nav /><ResetPasswordPage /><Footer /></>} />
            <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
            <Route path="/admin/*" element={<AdminLayout />} />

            <Route path="/micmtaani" element={<MicMtaaniPage />} />
            <Route path="/micmtaani/news" element={<MicMtaaniArticlesPage />} />
            <Route path="/micmtaani/article/:slug" element={<MicMtaaniArticlePage />} />
            <Route path="/micmtaani/category/:slug" element={<MicMtaaniCategoryPage />} />
            <Route path="/micmtaani/events" element={<MicMtaaniEventsPage />} />
            <Route path="/micmtaani/businesses" element={<MicMtaaniBusinessesPage />} />
            <Route path="/micmtaani/business/:slug" element={<MicMtaaniBusinessDetailPage />} />
            <Route path="/micmtaani/submit" element={<MicMtaaniSubmitPage />} />
            <Route path="/micmtaani/search" element={<MicMtaaniSearchPage />} />
            <Route path="/micmtaani/tag/:tag" element={<MicMtaaniTagPage />} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

function FilmRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/films/${slug}`} replace />
}

function TalentRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/talent/${slug}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', transition: 'background 0.3s, color 0.3s' }}>
            <AppRoutes />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
