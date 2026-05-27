import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import {
  STATUT_MATERIEL_LABELS, STATUT_MATERIEL_COLORS, formatDate,
} from '@/lib/utils'

export default async function MaterielsPage({
  searchParams,
}: {
  searchParams: { q?: string; statut?: string }
}) {
  const q = searchParams.q ?? ''
  const statut = searchParams.statut ?? ''

  const materiels = await prisma.materiel.findMany({
    where: {
      AND: [
        statut ? { statut: statut as any } : {},
        q
          ? {
              OR: [
                { numeroInventaire: { contains: q, mode: 'insensitive' } },
                { numeroSerie: { contains: q, mode: 'insensitive' } },
                { article: { designation: { contains: q, mode: 'insensitive' } } },
                { article: { marque: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {},
      ],
    },
    include: {
      article: { include: { lot: { include: { acquisition: true } } } },
      affectations: { where: { dateFin: null }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Matériels" />
      <main className="flex-1 p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <form className="flex gap-2 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher par N° inventaire, désignation, marque..."
                className="input pl-9"
              />
            </div>
            <select name="statut" defaultValue={statut} className="input w-48">
              <option value="">Tous les statuts</option>
              {Object.entries(STATUT_MATERIEL_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <button type="submit" className="btn-secondary">Filtrer</button>
          </form>
          <Link href="/materiels/nouveau" className="btn-primary">
            <Plus size={16} />
            Nouveau matériel
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">{materiels.length} matériel(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Inventaire</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Désignation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marque / Modèle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Série</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fin garantie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Direction affectée</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {materiels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucun matériel trouvé.
                    </td>
                  </tr>
                ) : (
                  materiels.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{m.numeroInventaire}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{m.article.designation}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{m.article.marque} {m.article.modele}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-400">{m.numeroSerie ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${STATUT_MATERIEL_COLORS[m.statut]}`}>
                          {STATUT_MATERIEL_LABELS[m.statut]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(m.dateFinGarantie)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{m.affectations[0]?.direction ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/materiels/${m.id}`}
                          className="text-xs text-green-700 font-medium hover:underline"
                        >
                          Détail
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  )
}
