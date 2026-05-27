import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  STATUT_REPARATION_LABELS, STATUT_REPARATION_COLORS,
  formatDate, formatCurrency,
} from '@/lib/utils'

export default async function ReparationsPage({
  searchParams,
}: {
  searchParams: { panneId?: string }
}) {
  const panneId = searchParams.panneId ? Number(searchParams.panneId) : undefined

  const reparations = await prisma.reparation.findMany({
    where: panneId ? { panneId } : undefined,
    include: {
      panne: { include: { materiel: { include: { article: true } } } },
      technicien: true,
      societe: true,
    },
    orderBy: { dateDebut: 'desc' },
  })

  const TYPE_LABELS: Record<string, string> = {
    CORRECTIVE: 'Corrective',
    PREVENTIVE: 'Préventive',
  }

  return (
    <>
      <Header title="Réparations" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{reparations.length} réparation(s)</p>
          <Link href="/reparations/nouvelle" className="btn-primary">
            <Plus size={16} />
            Nouvelle réparation
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code Bon</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matériel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Technicien</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Société</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Début</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Coût</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {reparations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucune réparation enregistrée.
                    </td>
                  </tr>
                ) : reparations.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{r.codeBon}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {r.panne.materiel.article.designation}
                      </p>
                      <p className="text-xs font-mono text-gray-400">{r.panne.materiel.numeroInventaire}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-purple-100 text-purple-800">
                        {TYPE_LABELS[r.typeMaintenance]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.technicien.prenom} {r.technicien.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.societe.nom}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.dateDebut)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(r.dateFin)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(r.cout ?? null)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUT_REPARATION_COLORS[r.statut]}`}>
                        {STATUT_REPARATION_LABELS[r.statut]}
                      </span>
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
