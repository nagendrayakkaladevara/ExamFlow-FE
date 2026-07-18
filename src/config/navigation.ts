import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  Users,
  Vote,
} from 'lucide-react'
import type { UserRole } from '@/types/enums'

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  roles: UserRole[]
}

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['ADMIN'],
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    roles: ['ADMIN'],
  },
  {
    title: 'Classes',
    href: '/admin/classes',
    icon: GraduationCap,
    roles: ['ADMIN'],
  },
  {
    title: 'Circulars',
    href: '/admin/circulars',
    icon: Megaphone,
    roles: ['ADMIN'],
  },
  {
    title: 'Polls',
    href: '/admin/polls',
    icon: Vote,
    roles: ['ADMIN'],
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
  {
    title: 'Dashboard',
    href: '/lecturer',
    icon: LayoutDashboard,
    roles: ['LECTURER'],
  },
  {
    title: 'Question Bank',
    href: '/lecturer/questions',
    icon: BookOpen,
    roles: ['LECTURER'],
  },
  {
    title: 'Assignments',
    href: '/lecturer/assignments',
    icon: ClipboardList,
    roles: ['LECTURER'],
  },
  {
    title: 'Circulars',
    href: '/lecturer/circulars',
    icon: Megaphone,
    roles: ['LECTURER'],
  },
  {
    title: 'Polls',
    href: '/lecturer/polls',
    icon: Vote,
    roles: ['LECTURER'],
  },
  {
    title: 'Analytics',
    href: '/lecturer/analytics',
    icon: BarChart3,
    roles: ['LECTURER'],
  },
  {
    title: 'Dashboard',
    href: '/student',
    icon: LayoutDashboard,
    roles: ['STUDENT'],
  },
  {
    title: 'Assignments',
    href: '/student/assignments',
    icon: ClipboardList,
    roles: ['STUDENT'],
  },
  {
    title: 'Circulars',
    href: '/student/circulars',
    icon: Megaphone,
    roles: ['STUDENT'],
  },
  {
    title: 'Polls',
    href: '/student/polls',
    icon: Vote,
    roles: ['STUDENT'],
  },
  {
    title: 'My Performance',
    href: '/student/analytics',
    icon: BarChart3,
    roles: ['STUDENT'],
  },
]

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navigationItems.filter((item) => item.roles.includes(role))
}

export function getRoleBasePath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'LECTURER':
      return '/lecturer'
    case 'STUDENT':
      return '/student'
  }
}
