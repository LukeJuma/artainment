import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ScrollToTop } from './components/ui/ScrollToTop'
import { Nav } from './components/ui/Nav'
import { Footer } from './components/ui/Footer'
import { Loader } from './components/ui/Loader'
import { HomePage } from './pages/HomePage'
import { FilmsPage } from './pages/FilmsPage'
import { FilmDetailPage } from './pages/FilmDetailPage'
import { ServicesPage } from './pages/ServicesPage'
import { TalentPage } from './pages/TalentPage'
import { TalentDetailPage } from './pages/TalentDetailPage'
import { ProductionsPage } from './pages/ProductionsPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminPage } from './pages/AdminPage'
import { AdminLayout } from './admin/layout/AdminLayout'
import { MicMtaaniPage } from './pages/MicMtaaniPage'
import { MicMtaaniArticlePage } from './pages/MicMtaaniArticlePage'
import { MicMtaaniArticlesPage } from './pages/MicMtaaniArticlesPage'
import { MicMtaaniCategoryPage } from './pages/MicMtaaniCategoryPage'
import { MicMtaaniEventsPage } from './pages/MicMtaaniEventsPage'
import { MicMtaaniBusinessesPage } from './pages/MicMtaaniBusinessesPage'
import { MicMtaaniBusinessDetailPage } from './pages/MicMtaaniBusinessDetailPage'
import { MicMtaaniSubmitPage } from './pages/MicMtaaniSubmitPage'
import { MicMtaaniSearchPage } from './pages/MicMtaaniSearchPage'
import { MicMtaaniTagPage } from './pages/MicMtaaniTagPage'
import { NotFoundPage } from './pages/NotFoundPage'

const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
}

function AppRoutes() {
  const { loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loader />
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial="initial" animate="animate" exit="exit" variants={pageTransition}>
        <Routes location={location}>
          <Route path="/" element={<><Nav /><HomePage /><Footer /></>} />
          <Route path="/films" element={<><Nav /><FilmsPage /><Footer /></>} />
          <Route path="/films/:slug" element={<><Nav /><FilmDetailPage /><Footer /></>} />
          <Route path="/services" element={<><Nav /><ServicesPage /><Footer /></>} />
          <Route path="/talent" element={<><Nav /><TalentPage /><Footer /></>} />
          <Route path="/talent/:slug" element={<><Nav /><TalentDetailPage /><Footer /></>} />
          <Route path="/productions" element={<><Nav /><ProductionsPage /><Footer /></>} />
          <Route path="/about" element={<><Nav /><AboutPage /><Footer /></>} />
          <Route path="/contact" element={<><Nav /><ContactPage /><Footer /></>} />
          <Route path="/login" element={<><Nav /><LoginPage /><Footer /></>} />
          <Route path="/register" element={<><Nav /><RegisterPage /><Footer /></>} />
          <Route path="/admin/login" element={<><Nav /><AdminPage /><Footer /></>} />
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
      </motion.div>
    </AnimatePresence>
  )
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
