import { motion } from 'framer-motion'
import { MiniChart } from './ChartCard'
import { AnimatedCounter } from './AnimatedCounter'

interface StatCardProps {
  title: string
  value: string | number
  numericValue?: number
  change: number
  changeLabel?: string
  icon: React.ReactNode
  color: string
  chartType?: 'area' | 'line' | 'bar'
  chartData?: number[]
  delay?: number
}

export function StatCard({
  title,
  value,
  numericValue,
  change,
  changeLabel = 'this month',
  icon,
  color,
  chartType = 'area',
  chartData,
  delay = 0,
}: StatCardProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        background: 'var(--admin-card)',
        border: '1px solid var(--admin-border)',
        borderRadius: 'var(--admin-radius-lg)',
        padding: '22px',
        cursor: 'default',
        overflow: 'hidden',
        position: 'relative',
      }}
      whileHover={{
        y: -2,
        boxShadow: '0 8px 32px rgba(0,0,0,.25)',
        borderColor: 'rgba(255,255,255,0.10)',
        transition: { duration: 0.2 },
      }}
    >
      <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at top right, ${color}08, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 'var(--admin-radius-md)',
          background: `${color}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        {chartData && chartData.length > 0 && (
          <div style={{ flexShrink: 0, marginLeft: 8 }}>
            <MiniChart data={chartData} color={color} type={chartType} height={36} width={76} />
          </div>
        )}
      </div>

      <div>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: 'var(--admin-text-muted)',
          marginBottom: 8,
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--admin-text)',
          lineHeight: 1,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.02em',
        }}>
          {typeof numericValue === 'number' ? (
            <AnimatedCounter value={numericValue} prefix={value.toString().replace(/[\d,]+/, '')} />
          ) : value}
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginTop: 12,
        fontSize: 12,
        fontWeight: 600,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 2,
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: 11,
          background: isPositive ? 'var(--admin-success-glow)' : 'var(--admin-danger-glow)',
          color: isPositive ? 'var(--admin-success)' : 'var(--admin-danger)',
        }}>
          {isPositive ? '↑' : '↓'} {Math.abs(change)}%
        </span>
        <span style={{ color: 'var(--admin-text-muted)', fontWeight: 500 }}>{changeLabel}</span>
      </div>
    </motion.div>
  )
}
