import { motion } from 'framer-motion'

export function Loader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        style={{ width: 40, height: 40, border: '3px solid rgba(240,0,0,0.2)', borderTopColor: '#F00000', borderRadius: '50%' }}
      />
    </div>
  )
}
