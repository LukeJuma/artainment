import { motion } from 'framer-motion'
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

interface ChartCardProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  actions?: React.ReactNode
  delay?: number
}

export function ChartCard({ title, subtitle, children, actions, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      className="admin-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="admin-card-header">
        <div>
          <div className="admin-card-title">{title}</div>
          {subtitle && (
            <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>{subtitle}</div>
          )}
        </div>
        {actions && <div style={{ display: 'flex', gap: 6 }}>{actions}</div>}
      </div>
      {children}
    </motion.div>
  )
}

interface MiniChartProps {
  data: number[]
  color: string
  type?: 'area' | 'line' | 'bar'
  height?: number
  width?: number
}

export function MiniChart({ data, color, type = 'area', height = 40, width = 80 }: MiniChartProps) {
  const chartData = data.map((v, i) => ({ v, i }))
  const gradientId = `mini-${color.replace('#', '')}-${Math.random().toString(36).slice(2, 6)}`

  if (type === 'area') {
    return (
      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gradientId})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (type === 'line') {
    return (
      <ResponsiveContainer width={width} height={height}>
        <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.9} />
            <stop offset="100%" stopColor={color} stopOpacity={0.4} />
          </linearGradient>
        </defs>
        <Bar dataKey="v" fill={`url(#${gradientId})`} radius={[2, 2, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export const chartTooltipStyle: React.CSSProperties = {
  background: 'var(--admin-card)',
  border: '1px solid var(--admin-border)',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 12,
  color: 'var(--admin-text)',
  fontWeight: 500,
  boxShadow: '0 8px 24px rgba(0,0,0,.4)',
  fontFamily: 'Inter, sans-serif',
}

export { ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis, Tooltip }
