import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IconX } from './Icons'
import { parseYouTubeId, YouTubePlayer } from './YouTubePlayer'

interface VideoModalProps {
  src: string
  title: string
  poster?: string | null
  onClose: () => void
}

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export function VideoModal({ src, title, poster, onClose }: VideoModalProps) {
  const reduced = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [failed, setFailed] = useState(false)
  const youTubeId = parseYouTubeId(src)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      className="film-trailer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,5,7,0.88)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={reduced ? { duration: 0 } : { duration: 0.32, ease: EASE }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ position: 'relative', width: 'min(960px, 100%)' }}
      >
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000',
          borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.75)',
        }}>
          {failed ? (
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center',
              color: 'rgba(255,255,255,0.85)', fontFamily: 'DM Sans, sans-serif',
            }}>
              <p style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>Unable to load this video.</p>
              <p style={{ fontSize: 14, margin: 0, color: 'rgba(255,255,255,0.6)' }}>
                Full films require an active subscription. Please log in or subscribe to watch.
              </p>
              <a href="/login" className="btn-red" style={{ marginTop: 8 }}>Log in</a>
            </div>
          ) : youTubeId ? (
            <YouTubePlayer videoId={youTubeId} />
          ) : (
            <video
              key={src}
              src={src}
              controls
              autoPlay
              playsInline
              preload="metadata"
              poster={poster || undefined}
              onError={() => setFailed(true)}
              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', background: '#000' }}
            />
          )}
        </div>
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label={`Close ${title}`}
          style={{
            position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.55)',
            color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)', zIndex: 2,
          }}
        >
          <IconX size={18} />
        </button>
      </motion.div>
    </motion.div>
  )
}
