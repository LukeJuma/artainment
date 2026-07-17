import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { PLACEHOLDER } from '../../lib/constants'

export function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 600], [0, 180])
  const opacity = useTransform(scrollY, [0, 400], [1, 0])
  const words = ['Creating.', 'Producing.', 'Streaming.', 'Inspiring.']
  const [wordIdx, setWordIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setWordIdx(i => (i + 1) % words.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="hero" style={{ position: 'relative', height: '100vh', minHeight: 700, overflow: 'hidden' }}>
      <motion.div style={{ y, position: 'absolute', inset: '-10% 0', zIndex: 0 }}>
        <img src={PLACEHOLDER.hero} alt="The Artainment film production"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(41,40,44,0.92) 0%, rgba(41,40,44,0.6) 50%, rgba(240,0,0,0.12) 100%)' }} />
      </motion.div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.04, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', backgroundSize: '256px' }} />
      <motion.div style={{ opacity, position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px' }}
        className="hero-content">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 48, height: 1, background: '#F00000' }} />
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, letterSpacing: 4, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>Kenya's Premier Creative Studio</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(52px, 8vw, 108px)', fontWeight: 700, lineHeight: 0.92, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>THE</motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(52px, 8vw, 108px)', fontWeight: 700, lineHeight: 0.92, color: '#F00000', margin: '0 0 8px', letterSpacing: '-0.02em' }}>ARTAINMENT</motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} style={{ marginTop: 24, marginBottom: 48, overflow: 'hidden', height: 52 }}>
          <AnimatePresence mode="wait">
            <motion.p key={wordIdx} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }} transition={{ duration: 0.4 }}
              style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 300, fontStyle: 'italic', color: '#F7BB0E', margin: 0 }}>
              {words[wordIdx]}
            </motion.p>
          </AnimatePresence>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
          style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link to="/films" className="btn-primary" style={{ background: '#F00000', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '16px 36px', borderRadius: 6, textDecoration: 'none', transition: 'all 0.2s' }}>Watch Films</Link>
          <Link to="/services" className="btn-outline" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '16px 36px', borderRadius: 6, textDecoration: 'none', transition: 'all 0.2s' }}>Explore Services</Link>
          <Link to="/about" className="btn-gold" style={{ background: 'transparent', border: '1px solid rgba(247,187,14,0.4)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#F7BB0E', padding: '16px 36px', borderRadius: 6, textDecoration: 'none', transition: 'all 0.2s' }}>Join The Collective</Link>
        </motion.div>
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
      </motion.div>
    </section>
  )
}
