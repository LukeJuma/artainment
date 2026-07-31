import {
  LayoutDashboard, BarChart3, Film, Tv, Music, Mic, Calendar, Trophy,
  Users, CreditCard, Ticket, Star, FileText, Shield, Megaphone, Bell,
  MessageSquare, Settings, Terminal, UserCog, LogOut, Headphones,
  Radio, TrendingUp, DollarSign, Eye, Podcast
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: any
  badge?: number | string
  badgeType?: 'default' | 'warning' | 'success'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Content',
    items: [
      { id: 'movies', label: 'Movies', icon: Film },
      { id: 'series', label: 'Series', icon: Tv },
      { id: 'music', label: 'Music', icon: Music },
      { id: 'podcasts', label: 'Podcasts', icon: Podcast },
    ],
  },
  {
    title: 'Live',
    items: [
      { id: 'events', label: 'Events', icon: Calendar, badge: 3 },
      { id: 'ticketing', label: 'Ticketing', icon: Ticket },
      { id: 'micmtaani', label: 'Mic Mtaani', icon: Trophy, badge: 'LIVE' as string | number, badgeType: 'warning' as const },
    ],
  },
  {
    title: 'People',
    items: [
      { id: 'artists', label: 'Artists', icon: Star },
      { id: 'users', label: 'Users', icon: Users },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
      { id: 'payments', label: 'Payments', icon: DollarSign },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'reviews', label: 'Reviews', icon: Star, badge: 12 },
      { id: 'moderation', label: 'Moderation', icon: Shield, badge: 5, badgeType: 'warning' as const },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'logs', label: 'System Logs', icon: Terminal },
      { id: 'admins', label: 'Admins', icon: UserCog },
    ],
  },
]

export const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  movies: 'Movies',
  series: 'TV Series',
  music: 'Music',
  podcasts: 'Podcasts',
  events: 'Events',
  ticketing: 'Ticketing',
  micmtaani: 'Mic Mtaani',
  artists: 'Artists',
  users: 'Users',
  subscriptions: 'Subscriptions',
  payments: 'Payments',
  reviews: 'Reviews',
  moderation: 'Moderation',
  marketing: 'Marketing',
  notifications: 'Notifications',
  messages: 'Messages',
  settings: 'Settings',
  logs: 'System Logs',
  admins: 'Admins',
}
