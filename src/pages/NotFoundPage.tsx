import { Link } from 'react-router-dom'
import { Nav } from '../components/ui/Nav'
import { Footer } from '../components/ui/Footer'

export function NotFoundPage() {
  return (
    <>
      <Nav />
      <div style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: 'clamp(16px, 5vw, 80px)',
      }}>
        <h1 style={{
          fontFamily: 'Chonburi, cursive', fontSize: 'clamp(64px, 15vw, 120px)',
          lineHeight: 1, color: 'var(--red)', marginBottom: 16,
        }}>404</h1>
        <p style={{
          fontFamily: 'Domine, serif', fontSize: 'clamp(16px, 2.5vw, 22px)',
          color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 420,
        }}>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-red" style={{ padding: '14px 40px' }}>
          Back to Home
        </Link>
      </div>
      <Footer />
    </>
  )
}
