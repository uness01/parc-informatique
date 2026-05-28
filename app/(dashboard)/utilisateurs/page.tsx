import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/utils'
import { UtilisateursTable } from '@/components/UtilisateursTable'

// ─── Page ─────────────────────────────────────────────────────

export default async function UtilisateursPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if ((session.user as any).role !== 'ADMIN') redirect('/acces-interdit')

  const currentId = Number((session.user as any).id)

  const utilisateurs = await prisma.utilisateur.findMany({
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  })

  const rows = utilisateurs.map((u) => ({
    id:     u.id,
    nom:    u.nom,
    prenom: u.prenom,
    email:  u.email,
    login:  u.login,
    role:   u.role,
    actif:  u.actif,
    isSelf: u.id === currentId,
  }))

  const activeCount   = utilisateurs.filter((u) => u.actif).length
  const inactiveCount = utilisateurs.length - activeCount

  const roleBreakdown = Object.entries(ROLE_LABELS).map(([role, label]) => ({
    role, label,
    count: utilisateurs.filter((u) => u.role === role).length,
  })).filter((r) => r.count > 0)

  return (
    <>
      <Header title="Utilisateurs" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Utilisateurs</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {utilisateurs.length} compte(s)
              {activeCount > 0   && <span className="text-green-700 font-medium"> — {activeCount} actif(s)</span>}
              {inactiveCount > 0 && <span className="text-gray-400"> · {inactiveCount} inactif(s)</span>}
            </p>
          </div>
          <Link href="/utilisateurs/nouveau" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Nouvel utilisateur
          </Link>
        </div>

        {/* ── Stats bar ────────────────────────────────── */}
        {roleBreakdown.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {roleBreakdown.map(({ role, label, count }) => (
              <div
                key={role}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg shadow-sm"
              >
                <Users size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ────────────────────────────────────── */}
        <UtilisateursTable data={rows} />

      </main>
    </>
  )
}
