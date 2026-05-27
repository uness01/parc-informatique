import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function AffectationsPage() {
  const affectations = await prisma.affectation.findMany({
    include: {
      materiel: { include: { article: true } },
      utilisateur: true,
    },
    orderBy: { dateDebut: 'desc' },
  })

  const ETAT_RETOUR_LABELS: Record<string, string> = {
    BON: 'Bon état',
    MOYEN: 'État moyen',
    MAUVAIS: 'Mauvais état',
  }
  const ETAT_RETOUR_COLORS: Record<string, string> = {
    BON: 'bg-green-100 text-green-800',
    MOYEN: 'bg-yellow-100 text-yellow-800',
    MAUVAIS: 'bg-red-100 text-red-800',
  }

  return (
    <>
      <Header title="Affectations" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{affectations.length} affectation(s)</p>
          <Link href="/affectations/nouvelle" className="btn-primary">
            <Plus size={16} />
            Nouvelle affectation
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matériel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Direction</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Entité</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Bureau</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Début</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">État retour</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {affectations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucune affectation enregistrée.
                    </td>
                  </tr>
                ) : affectations.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{a.materiel.article.designation}</p>
                      <p className="text-xs font-mono text-gray-400">{a.materiel.numeroInventaire}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{a.direction}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.entite}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.bureau ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {a.utilisateur.prenom} {a.utilisateur.nom}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(a.dateDebut)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.dateFin ? formatDate(a.dateFin) : (
                        <span className="badge bg-green-100 text-green-700">En cours</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {a.etatRetour ? (
                        <span className={`badge ${ETAT_RETOUR_COLORS[a.etatRetour]}`}>
                          {ETAT_RETOUR_LABELS[a.etatRetour]}
                        </span>
                      ) : '—'}
                    </td>
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
