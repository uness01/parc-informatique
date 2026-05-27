import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import { ROLE_LABELS, formatDate } from '@/lib/utils'

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-800',
  GESTIONNAIRE: 'bg-blue-100 text-blue-800',
  TECHNICIEN: 'bg-orange-100 text-orange-800',
  CONSULTANT: 'bg-gray-100 text-gray-700',
}

export default async function UtilisateursPage() {
  const utilisateurs = await prisma.utilisateur.findMany({
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  })

  return (
    <>
      <Header title="Utilisateurs" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{utilisateurs.length} utilisateur(s)</p>
          <Link href="/utilisateurs/nouveau" className="btn-primary">
            <Plus size={16} />
            Nouvel utilisateur
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom complet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Créé le</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {utilisateurs.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.prenom.charAt(0)}{u.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{u.prenom} {u.nom}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${ROLE_COLORS[u.role]}`}>{ROLE_LABELS[u.role]}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.actif ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium">
                          <CheckCircle size={13} />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                          <XCircle size={13} />
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
