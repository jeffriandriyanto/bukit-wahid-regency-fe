import type { SidebarItem } from '~/types/sidebar'

export const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-house',
    to: '/dashboard'
  },
  {
    label: 'Profil & Struktur Organisasi',
    icon: 'i-lucide-users',
    to: '/profile-structure'
  }
]
