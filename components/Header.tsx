'use client'

import { useSession, signOut } from 'next-auth/react'
import { Menu, Landmark, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { ROLE_LABELS } from '@/lib/utils'
import { useSidebar } from './DashboardShell'

const ROLE_BADGE: Record<string, string> = {
  ADMIN:        'bg-red-100 text-red-700 border border-red-200',
  GESTIONNAIRE: 'bg-blue-100 text-blue-700 border border-blue-200',
  TECHNICIEN:   'bg-orange-100 text-orange-700 border border-orange-200',
  CONSULTANT:   'bg-gray-100 text-gray-600 border border-gray-200',
}

export function Header({ title }: { title?: string }) {
  const { data: session } = useSession()
  const { toggle } = useSidebar()
  const role  = (session?.user as any)?.role as string | undefined
  const name  = session?.user?.name ?? '—'
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="
      sticky top-0 z-40 h-14
      flex items-center justify-between
      bg-white border-b border-gray-200
      px-5 shadow-sm
    ">

      {/* ── Left: hamburger (mobile) + Ministry logo ──────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggle}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>
        {/* Icon badge */}
        <div className="
          flex-shrink-0 w-8 h-8 rounded-lg
          bg-gradient-to-br from-green-700 to-green-900
          flex items-center justify-center shadow-sm
        ">
          <Landmark size={15} className="text-white" />
        </div>

        {/* Ministry name — hidden on small screens */}
        <div className="hidden md:block min-w-0">
          <p className="text-[11px] font-bold text-green-800 leading-tight truncate">
            Ministère de la Transition Énergétique et du Développement Durable
          </p>
          <p className="text-[10px] text-green-600 font-medium">
            Gestion du Parc Informatique
          </p>
        </div>

        {/* Page title separator + title (optional) */}
        {title && (
          <>
            <div className="hidden md:block h-6 w-px bg-gray-200 mx-1" />
            <p className="text-sm font-semibold text-gray-600 truncate hidden sm:block">{title}</p>
          </>
        )}
      </div>

      {/* ── Right: User menu ─────────────────────────────── */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="
            flex items-center gap-2.5 pl-2 pr-2.5 py-1.5
            rounded-xl border border-gray-200
            hover:bg-gray-50 hover:border-gray-300
            transition-colors duration-150
          "
        >
          {/* Avatar */}
          <div className="
            w-7 h-7 rounded-lg
            bg-gradient-to-br from-green-700 to-green-900
            flex items-center justify-center
            text-white text-[10px] font-bold
            shadow-sm flex-shrink-0
          ">
            {initials}
          </div>

          {/* Name + role */}
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{name}</p>
            <p className="text-[10px] text-gray-400 leading-tight">
              {ROLE_LABELS[role ?? ''] ?? role}
            </p>
          </div>

          {/* Chevron */}
          <ChevronDown
            size={13}
            className={`text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="
            absolute right-0 top-full mt-1.5 w-56
            bg-white rounded-xl border border-gray-200
            shadow-xl shadow-gray-200/80
            py-1.5 z-50
            animate-in fade-in slide-in-from-top-1 duration-100
          ">
            {/* User info block */}
            <div className="px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="
                  w-9 h-9 rounded-xl flex-shrink-0
                  bg-gradient-to-br from-green-700 to-green-900
                  flex items-center justify-center
                  text-white text-xs font-bold shadow-sm
                ">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                  {role && (
                    <span className={`inline-block mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${ROLE_BADGE[role] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ROLE_LABELS[role] ?? role}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="
                w-full flex items-center gap-2.5 px-4 py-2.5
                text-sm font-medium text-red-600
                hover:bg-red-50 transition-colors duration-100
              "
            >
              <LogOut size={14} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
