import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserCog } from 'lucide-react'
import { UtilisateurForm } from '@/components/UtilisateurForm'
import { ROLE_LABELS } from '@/lib/utils'

// ─── Role badge colors ────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN:        'bg-red-100 text-red-800',
  GESTIONNAIRE: 'bg-blue-100 text-blue-800',
  TECHNICIEN:   'bg-orange-100 text-orange-800',
  CONSULTANT:   'bg-gray-100 text-gray-700',
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ModifierUtilisateurPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if ((session.user as any).role !== 'ADMIN') redirect('/acces-interdit')

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const user = await prisma.utilisateur.findUnique({ where: { id } })
  if (!user) notFound()

  return (
    <>
      <Header title="Modifier un utilisateur" />
      <main className="flex-1 p-6">

        <Link
          href="/utilisateurs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux utilisateurs
        </Link>

        <div className="max-w-xl">
          <div className="card">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user.prenom.charAt(0)}{user.nom.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.prenom} {user.nom}
                  </h2>
                  <span className={`badge text-[10px] ${ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-700'}`}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              <UserCog size={16} className="ml-auto text-gray-300" />
            </div>

            <UtilisateurForm
              mode="edit"
              userId={user.id}
              defaultValues={{
                nom:    user.nom,
                prenom: user.prenom,
                email:  user.email,
                login:  user.login ?? '',
                role:   user.role,
                actif:  user.actif,
              }}
            />

          </div>
        </div>

      </main>
    </>
  )
}
