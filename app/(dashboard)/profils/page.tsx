import { Header } from '@/components/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { ROLE_LABELS, formatDate } from '@/lib/utils'
import bcrypt from 'bcryptjs'

const ROLE_BADGE: Record<string, string> = {
  ADMIN:        'bg-red-100 text-red-700',
  GESTIONNAIRE: 'bg-blue-100 text-blue-700',
  TECHNICIEN:   'bg-orange-100 text-orange-700',
  CONSULTANT:   'bg-gray-100 text-gray-600',
}

async function updatePassword(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session?.user) return

  const userId       = Number((session.user as any).id)
  const current      = formData.get('currentPassword') as string
  const newPassword  = formData.get('newPassword') as string
  const confirmation = formData.get('confirmation') as string

  if (newPassword !== confirmation) return

  const user = await prisma.utilisateur.findUnique({ where: { id: userId } })
  if (!user) return

  const valid = await bcrypt.compare(current, user.password)
  if (!valid) return

  const hashed = await bcrypt.hash(newPassword, 10)
  await prisma.utilisateur.update({ where: { id: userId }, data: { password: hashed } })
  redirect('/profils?updated=1')
}

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: { updated?: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const userId = Number((session.user as any).id)
  const user = await prisma.utilisateur.findUnique({ where: { id: userId } })
  if (!user) redirect('/login')

  const role = user.role as string

  return (
    <>
      <Header title="Mon profil" />
      <main className="flex-1 p-6 max-w-2xl space-y-6">

        {searchParams.updated && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg">
            Mot de passe mis à jour avec succès.
          </div>
        )}

        {/* Profile card */}
        <div className="card">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0">
              {user.prenom.charAt(0)}{user.nom.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">
                {user.prenom} {user.nom}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className={`badge ${ROLE_BADGE[role] ?? 'bg-gray-100 text-gray-600'}`}>
                  {ROLE_LABELS[role] ?? role}
                </span>
                <span className={`badge ${user.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {user.actif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <User size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Nom complet</p>
                <p className="font-medium text-gray-800">{user.prenom} {user.nom}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Mail size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Adresse email</p>
                <p className="font-medium text-gray-800">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Shield size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Rôle</p>
                <p className="font-medium text-gray-800">{ROLE_LABELS[role] ?? role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Calendar size={15} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Membre depuis</p>
                <p className="font-medium text-gray-800">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 className="text-base font-bold text-gray-900 mb-4">Changer le mot de passe</h3>
          <form action={updatePassword} className="space-y-4">
            <div>
              <label className="label">Mot de passe actuel *</label>
              <input name="currentPassword" type="password" required className="input" autoComplete="current-password" />
            </div>
            <div>
              <label className="label">Nouveau mot de passe *</label>
              <input name="newPassword" type="password" required minLength={6} className="input" autoComplete="new-password" />
            </div>
            <div>
              <label className="label">Confirmer le nouveau mot de passe *</label>
              <input name="confirmation" type="password" required minLength={6} className="input" autoComplete="new-password" />
            </div>
            <button type="submit" className="btn-primary">Mettre à jour</button>
          </form>
        </div>

      </main>
    </>
  )
}
