'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Package,
  Layers,
  Tag,
  Truck,
  Monitor,
  MapPin,
  AlertTriangle,
  Wrench,
  Users,
  UserCog,
  List,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────

type Child = {
  name: string
  href: string
  icon: React.ElementType
  requiredRoles?: string[]
}

type NavItem =
  | { type: 'link'; name: string; href: string; icon: React.ElementType; adminOnly?: boolean }
  | { type: 'group'; name: string; icon: React.ElementType; base: string; children: Child[]; adminOnly?: boolean; visibleTo?: string[] }
  | { type: 'divider'; label: string; adminOnly?: boolean }

// ─── Navigation config ────────────────────────────────────────

const navigation: NavItem[] = [
  {
    type: 'link',
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },

  { type: 'divider', label: 'Menu principal' },

  {
    type: 'group',
    name: 'Acquisitions',
    icon: Package,
    base: '/acquisitions',
    visibleTo: ['ADMIN', 'GESTIONNAIRE', 'CONSULTANT'],
    children: [
      { name: 'Liste', href: '/acquisitions', icon: List },
      { name: 'Ajouter', href: '/acquisitions/nouveau', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE'] },
    ],
  },
  {
    type: 'group',
    name: 'Lots',
    icon: Layers,
    base: '/lots',
    visibleTo: ['ADMIN', 'GESTIONNAIRE', 'CONSULTANT'],
    children: [
      { name: 'Liste', href: '/lots', icon: List },
      { name: 'Ajouter', href: '/lots/nouveau', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE'] },
    ],
  },
  {
    type: 'group',
    name: 'Articles',
    icon: Tag,
    base: '/articles',
    visibleTo: ['ADMIN', 'GESTIONNAIRE', 'CONSULTANT'],
    children: [
      { name: 'Liste', href: '/articles', icon: List },
      { name: 'Ajouter', href: '/articles/nouveau', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE'] },
    ],
  },
  {
    type: 'group',
    name: 'Livraisons',
    icon: Truck,
    base: '/livraisons',
    visibleTo: ['ADMIN', 'GESTIONNAIRE', 'CONSULTANT'],
    children: [
      { name: 'Liste', href: '/livraisons', icon: List },
      { name: 'Ajouter', href: '/livraisons/nouveau', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE'] },
    ],
  },
  {
    type: 'group',
    name: 'Matériels',
    icon: Monitor,
    base: '/materiels',
    children: [
      { name: 'Liste', href: '/materiels', icon: List },
      { name: 'Ajouter', href: '/materiels/nouveau', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE'] },
    ],
  },
  {
    type: 'group',
    name: 'Affectations',
    icon: MapPin,
    base: '/affectations',
    children: [
      { name: 'Liste', href: '/affectations', icon: List },
      { name: 'Ajouter', href: '/affectations/nouvelle', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE'] },
    ],
  },
  {
    type: 'group',
    name: 'Pannes',
    icon: AlertTriangle,
    base: '/pannes',
    children: [
      { name: 'Liste', href: '/pannes', icon: List },
      { name: 'Ajouter', href: '/pannes/nouvelle', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN'] },
    ],
  },
  {
    type: 'group',
    name: 'Réparations',
    icon: Wrench,
    base: '/reparations',
    children: [
      { name: 'Liste', href: '/reparations', icon: List },
      { name: 'Ajouter', href: '/reparations/nouvelle', icon: Plus, requiredRoles: ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN'] },
    ],
  },

  { type: 'divider', label: 'Administration', adminOnly: true },

  {
    type: 'group',
    name: 'Utilisateurs',
    icon: Users,
    base: '/utilisateurs',
    adminOnly: true,
    children: [
      { name: 'Liste', href: '/utilisateurs', icon: List },
      { name: 'Ajouter', href: '/utilisateurs/nouveau', icon: Plus },
    ],
  },
  {
    type: 'link',
    name: 'Profils',
    href: '/profils',
    icon: UserCog,
    adminOnly: true,
  } as any,
]

// ─── NavGroup component ───────────────────────────────────────

function NavGroup({
  item,
  pathname,
  role,
}: {
  item: Extract<NavItem, { type: 'group' }>
  pathname: string
  role: string
}) {
  const isActive = pathname === item.base || pathname.startsWith(item.base + '/')
  const [open, setOpen] = useState(isActive)

  // Re-open when navigating to a child route
  useEffect(() => {
    if (isActive) setOpen(true)
  }, [isActive])

  const visibleChildren = item.children.filter(
    (c) => !c.requiredRoles || c.requiredRoles.includes(role)
  )

  return (
    <div>
      {/* Parent button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          group w-full flex items-center justify-between
          px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-100
          ${isActive
            ? 'bg-white/15 text-white'
            : 'text-green-100/80 hover:bg-white/10 hover:text-white'
          }
        `}
      >
        <span className="flex items-center gap-2.5">
          <item.icon
            size={16}
            className={isActive ? 'text-green-300' : 'text-green-400 group-hover:text-green-300'}
          />
          {item.name}
        </span>
        <span
          className={`transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
        >
          <ChevronDown size={13} className="text-green-400" />
        </span>
      </button>

      {/* Children — animated with max-height */}
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-0.5 ml-6 space-y-0.5 pb-1">
          {visibleChildren.map((child) => {
            const active = pathname === child.href
            const isAdd = child.icon === Plus
            return (
              <Link
                key={child.href}
                href={child.href}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-colors duration-100
                  ${active
                    ? 'bg-white/20 text-white'
                    : isAdd
                      ? 'text-green-300/80 hover:bg-white/10 hover:text-green-200'
                      : 'text-green-200/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <child.icon size={11} className={active ? 'text-green-300' : 'text-current opacity-60'} />
                {child.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role ?? 'CONSULTANT'
  const isAdmin = role === 'ADMIN'

  return (
    <aside
      className="
        fixed inset-y-0 left-0 z-50 w-64
        flex flex-col
        bg-gradient-to-b from-green-900 via-green-900 to-green-950
        shadow-[4px_0_24px_rgba(0,0,0,0.3)]
      "
    >
      {/* ── Brand ──────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pt-5 pb-4 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="
            w-9 h-9 rounded-xl
            bg-gradient-to-br from-green-500 to-green-700
            flex items-center justify-center flex-shrink-0
            shadow-lg shadow-green-950/50
            group-hover:scale-105 transition-transform
          ">
            <Monitor size={18} className="text-white drop-shadow" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-tight">
              Parc Informatique
            </p>
            <p className="text-green-400 text-[10px] font-semibold tracking-widest uppercase">
              GPI
            </p>
          </div>
        </Link>
        <p className="mt-2.5 text-[10px] text-green-500 leading-relaxed">
          Ministère de l&apos;Énergie, des Mines,
          <br />de l&apos;Eau et de l&apos;Environnement
        </p>
      </div>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5
        [&::-webkit-scrollbar]:w-1
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-white/10
        [&::-webkit-scrollbar-thumb]:rounded-full
      ">
        {navigation.map((item, i) => {
          // Skip admin-only items for non-admins
          if ((item as any).adminOnly && !isAdmin) return null

          // Skip groups not visible to this role
          if (item.type === 'group' && item.visibleTo && !item.visibleTo.includes(role)) return null

          if (item.type === 'divider') {
            return (
              <div key={i} className="pt-3 pb-1.5 px-2">
                <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-green-600">
                  {item.label}
                </p>
              </div>
            )
          }

          if (item.type === 'link') {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-100
                  ${active
                    ? 'bg-white/15 text-white'
                    : 'text-green-100/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <item.icon
                  size={16}
                  className={active ? 'text-green-300' : 'text-green-400'}
                />
                {item.name}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
              </Link>
            )
          }

          if (item.type === 'group') {
            return (
              <NavGroup key={item.base} item={item} pathname={pathname} role={role} />
            )
          }

          return null
        })}
      </nav>

      {/* ── Footer watermark ───────────────────────────── */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-white/10">
        <p className="text-[9px] text-green-700 text-center">
          © {new Date().getFullYear()} — Direction des Systèmes d&apos;Information
        </p>
      </div>
    </aside>
  )
}
