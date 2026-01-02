import type { SidebarItem } from '~/types/sidebar'

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/dashboard'
  },
  {
    label: 'Profil & Struktur',
    icon: 'i-lucide-users-round',
    to: '/profile-structure'
  },
  {
    label: 'Master Data',
    icon: 'i-lucide-database',
    to: '/master-data'
  },
  {
    label: 'Pengumuman & Berita',
    icon: 'i-lucide-megaphone',
    to: '/announcements-news'
  },
  {
    label: 'Agenda Pertemuan',
    icon: 'i-lucide-calendar-days',
    to: '/meeting-agenda'
  }
]
