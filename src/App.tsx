import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
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
import { MicMtaaniPage } from './pages/MicMtaaniPage'
import { MicMtaaniArticlePage } from './pages/MicMtaaniArticlePage'
import { MicMtaaniArticlesPage } from './pages/MicMtaaniArticlesPage'
import { MicMtaaniCategoryPage } from './pages/MicMtaaniCategoryPage'
import { MicMtaaniEventsPage } from './pages/MicMtaaniEventsPage'
import { MicMtaaniBusinessesPage } from './pages/MicMtaaniBusinessesPage'
import { MicMtaaniSubmitPage } from './pages/MicMtaaniSubmitPage'
import { MicMtaaniSearchPage } from './pages/MicMtaaniSearchPage'
import { MicMtaaniBusinessDetailPage } from './pages/MicMtaaniBusinessDetailPage'
import { MicMtaaniTagPage } from './pages/MicMtaaniTagPage'

function AppRoutes() {
  const { loading } = useAuth()
  if (loading) return <Loader />
  return (
    <Routes>
      {/* Artainment routes (own Nav + Footer) */}
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
      <Route path="/admin" element={<><Nav /><AdminPage /><Footer /></>} />

      {/* Mic Mtaani routes (own MMNavbar + MMFooter, no Artainment Nav/Footer) */}
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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ background: '#29282C', minHeight: '100vh' }}>
          <AppRoutes />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
