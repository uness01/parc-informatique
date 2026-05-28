import { Header } from '@/components/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Shield } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/utils'

// ─── Permissions matrix ───────────────────────────────────────

type Action = 'Consulter' | 'Ajouter' | 'Modifier' | 'Supprimer'
type Role   = 'ADMIN' | 'GESTIONNAIRE' | 'TECHNICIEN' | 'CONSULTANT'

type ModulePermissions = {
  module: string
  permissions: Record<Action, Record<Role, boolean>>
}

const ACTIONS: Action[] = ['Consulter', 'Ajouter', 'Modifier', 'Supprimer']
const ROLES: Role[]     = ['ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'CONSULTANT']

function adminGestionnaire(): Record<Role, boolean> {
  return { ADMIN: true, GESTIONNAIRE: true, TECHNICIEN: false, CONSULTANT: false }
}
function adminOnly(): Record<Role, boolean> {
  return { ADMIN: true, GESTIONNAIRE: false, TECHNICIEN: false, CONSULTANT: false }
}
function consultAndGestAndAdmin(): Record<Role, boolean> {
  return { ADMIN: true, GESTIONNAIRE: true, TECHNICIEN: false, CONSULTANT: true }
}
function techAndAbove(): Record<Role, boolean> {
  return { ADMIN: true, GESTIONNAIRE: true, TECHNICIEN: true, CONSULTANT: false }
}
function allCanView(): Record<Role, boolean> {
  return { ADMIN: true, GESTIONNAIRE: true, TECHNICIEN: true, CONSULTANT: true }
}

const MATRIX: ModulePermissions[] = [
  {
    module: 'Acquisitions',
    permissions: {
      Consulter:  consultAndGestAndAdmin(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Lots',
    permissions: {
      Consulter:  consultAndGestAndAdmin(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Articles',
    permissions: {
      Consulter:  consultAndGestAndAdmin(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Livraisons',
    permissions: {
      Consulter:  consultAndGestAndAdmin(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Matériels',
    permissions: {
      Consulter:  allCanView(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Affectations',
    permissions: {
      Consulter:  allCanView(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Pannes',
    permissions: {
      Consulter:  allCanView(),
      Ajouter:    techAndAbove(),
      Modifier:   techAndAbove(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Réparations',
    permissions: {
      Consulter:  allCanView(),
      Ajouter:    techAndAbove(),
      Modifier:   techAndAbove(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Sociétés',
    permissions: {
      Consulter:  consultAndGestAndAdmin(),
      Ajouter:    adminGestionnaire(),
      Modifier:   adminGestionnaire(),
      Supprimer:  adminOnly(),
    },
  },
  {
    module: 'Utilisateurs',
    permissions: {
      Consulter:  adminOnly(),
      Ajouter:    adminOnly(),
      Modifier:   adminOnly(),
      Supprimer:  adminOnly(),
    },
  },
]

// ─── Role colors ──────────────────────────────────────────────

const ROLE_HEADER_COLORS: Record<Role, string> = {
  ADMIN:        'bg-red-50 text-red-700',
  GESTIONNAIRE: 'bg-blue-50 text-blue-700',
  TECHNICIEN:   'bg-orange-50 text-orange-700',
  CONSULTANT:   'bg-gray-50 text-gray-600',
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ProfilsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if ((session.user as any).role !== 'ADMIN') redirect('/acces-interdit')

  return (
    <>
      <Header title="Profils &amp; Permissions" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Header ───────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Shield size={20} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Profils &amp; Permissions</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Matrice des droits d&apos;accès par rôle et par module
            </p>
          </div>
        </div>

        {/* ── Matrix ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                {/* Module + Action header */}
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-32">
                    Module
                  </th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-28">
                    Action
                  </th>
                  {ROLES.map((role) => (
                    <th key={role} className="px-3 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold ${ROLE_HEADER_COLORS[role]}`}>
                        {ROLE_LABELS[role]}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {MATRIX.map((item, _moduleIdx) => (
                  ACTIONS.map((action, actionIdx) => (
                    <tr
                      key={`${item.module}-${action}`}
                      className={`
                        border-b border-gray-50 transition-colors hover:bg-gray-50/50
                        ${actionIdx === ACTIONS.length - 1 ? 'border-b-2 border-gray-100' : ''}
                      `}
                    >
                      {/* Module name — only on first action row */}
                      {actionIdx === 0 ? (
                        <td
                          rowSpan={ACTIONS.length}
                          className="px-4 py-3 text-sm font-semibold text-gray-800 align-middle border-r border-gray-100"
                        >
                          {item.module}
                        </td>
                      ) : null}

                      {/* Action */}
                      <td className="px-3 py-2.5 text-xs text-gray-500 font-medium">
                        {action}
                      </td>

                      {/* Permission cells */}
                      {ROLES.map((role) => {
                        const allowed = item.permissions[action][role]
                        return (
                          <td key={role} className="px-3 py-2.5 text-center">
                            {allowed ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                                <span className="text-green-700 text-[10px] font-bold">✓</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100">
                                <span className="text-gray-300 text-[10px] font-bold">✗</span>
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Legend ───────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="font-semibold text-gray-700">Légende :</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
              <span className="text-green-700 text-[9px] font-bold">✓</span>
            </span>
            Autorisé
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100">
              <span className="text-gray-300 text-[9px] font-bold">✗</span>
            </span>
            Non autorisé
          </span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">
            Ces permissions sont définies par rôle et s&apos;appliquent à tous les utilisateurs du rôle correspondant.
          </span>
        </div>

      </main>
    </>
  )
}
