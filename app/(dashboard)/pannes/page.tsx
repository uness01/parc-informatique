import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import {
  STATUT_PANNE_LABELS, STATUT_PANNE_COLORS,
  PRIORITE_LABELS, PRIORITE_COLORS,
  formatDate,
} from '@/lib/utils'

export default async function PannesPage({
  searchParams,
}: {
  searchParams: { statut?: string; priorite?: string }
}) {
  const { statut, priorite } = searchParams

  const pannes = await prisma.panne.findMany({
    where: {
      ...(statut ? { statut: statut as any } : {}),
      ...(priorite ? { priorite: priorite as any } : {}),
    },
    include: {
      materiel: { include: { article: true } },
      utilisateur: true,
      _count: { select: { reparations: true } },
    },
    orderBy: { date: 'desc' },
  })

  return (
    <>
      <Header title="Pannes" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <form className="flex gap-2">
            <select name="statut" defaultValue={statut ?? ''} className="input w-44">
              <option value="">Tous les statuts</option>
              {Object.entries(STATUT_PANNE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select name="priorite" defaultValue={priorite ?? ''} className="input w-40">
              <option value="">Toutes priorités</option>
              {Object.entries(PRIORITE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary">Filtrer</button>
          </form>
          <Link href="/pannes/nouvelle" className="btn-primary">
            <Plus size={16} />
            Déclarer une panne
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">{pannes.length} panne(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matériel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priorité</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Déclaré par</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Réparations</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {pannes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucune panne enregistrée.
                    </td>
                  </tr>
                ) : pannes.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-400">#{p.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{p.materiel.article.designation}</p>
                      <p className="text-xs font-mono text-gray-400">{p.materiel.numeroInventaire}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate">{p.description}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${PRIORITE_COLORS[p.priorite]}`}>{PRIORITE_LABELS[p.priorite]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUT_PANNE_COLORS[p.statut]}`}>{STATUT_PANNE_LABELS[p.statut]}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {p.utilisateur.prenom} {p.utilisateur.nom}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(p.date)}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <Link href={`/reparations?panneId=${p.id}`} className="text-xs text-green-700 font-medium hover:underline">
                        {p._count.reparations} réparation(s)
                      </Link>
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
