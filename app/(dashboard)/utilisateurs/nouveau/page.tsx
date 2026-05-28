import { Header } from '@/components/Header'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus } from 'lucide-react'
import { UtilisateurForm } from '@/components/UtilisateurForm'

export default async function NouvelUtilisateurPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if ((session.user as any).role !== 'ADMIN') redirect('/acces-interdit')

  return (
    <>
      <Header title="Nouvel utilisateur" />
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
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <UserPlus size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Créer un utilisateur</h2>
                <p className="text-xs text-gray-400">Ajouter un nouveau compte au système</p>
              </div>
            </div>

            <UtilisateurForm mode="create" />

          </div>
        </div>

      </main>
    </>
  )
}
