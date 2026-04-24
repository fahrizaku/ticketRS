'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  Tag,
  LogOut,
  Building2,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import type { SessionUser } from '@/app/lib/definitions'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} />, roles: ['STAFF', 'TEKNISI', 'ADMIN'] },
  { label: 'Semua Tiket', href: '/tickets', icon: <Ticket size={18} />, roles: ['STAFF', 'TEKNISI', 'ADMIN'] },
  { label: 'Buat Tiket', href: '/tickets/new', icon: <PlusCircle size={18} />, roles: ['STAFF', 'ADMIN'] },
  { label: 'Kelola User', href: '/admin/users', icon: <Users size={18} />, roles: ['ADMIN'] },
  { label: 'Kategori', href: '/admin/categories', icon: <Tag size={18} />, roles: ['ADMIN'] },
]

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname()

  const filtered = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2 text-blue-600">
          <Building2 size={24} />
          <span className="font-bold text-lg">Ticket RS</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filtered.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-3 px-3">
          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block">
            {user.role}
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
