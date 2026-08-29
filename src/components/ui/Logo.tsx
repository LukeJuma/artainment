import { useTheme } from '../../contexts/ThemeContext'

interface LogoProps {
  type?: 'artainment' | 'micmtaani'
  height?: number
  light?: boolean
  style?: React.CSSProperties
}

export function Logo({ type = 'artainment', height = 36, light = false, style }: LogoProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (type === 'micmtaani') {
    return (
      <img
        src={light ? '/logos/micmtaani-dark.png' : (isDark ? '/logos/micmtaani-dark.png' : '/logos/micmtaani-light.png')}
        alt="Mic Mtaani"
        style={{ height, width: 'auto', objectFit: 'contain', display: 'block', ...style }}
      />
    )
  }

  return (
    <img
      src={light ? '/logos/artainment-dark.png' : (isDark ? '/logos/artainment-dark.png' : '/logos/artainment-light.png')}
      alt="The Artainment"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block', ...style }}
    />
  )
}

export function LogoFooter({ height = 40, style }: { height?: number; style?: React.CSSProperties }) {
  return (
    <img
      src="/logos/artainment-dark.png"
      alt="The Artainment"
      style={{ height, width: 'auto', objectFit: 'contain', display: 'block', ...style }}
    />
  )
}
