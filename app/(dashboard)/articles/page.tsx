import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { q?: string; lotId?: string }
}) {
  const q     = searchParams.q ?? ''
  const lotId = searchParams.lotId ? Number(searchParams.lotId) : undefined

  const articles = await prisma.article.findMany({
    where: {
      ...(lotId ? { lotId } : {}),
      ...(q
        ? {
            OR: [
              { designation: { contains: q, mode: 'insensitive' } },
              { marque:       { contains: q, mode: 'insensitive' } },
              { modele:       { contains: q, mode: 'insensitive' } },
              { numero:       { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      lot: { include: { acquisition: true } },
      _count: { select: { materiels: true, caracteristiques: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Articles" />
      <main className="flex-1 p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <form className="flex gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Rechercher par désignation, marque, modèle..."
                className="input pl-9"
              />
            </div>
            <button type="submit" className="btn-secondary">Filtrer</button>
          </form>
          <Link href="/articles/nouveau" className="btn-primary">
            <Plus size={15} />
            Ajouter un article
          </Link>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">{articles.length} article(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Désignation</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Marque / Modèle</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Prix unit.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qté prévue</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matériels</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fin garantie</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucun article trouvé.
                    </td>
                  </tr>
                ) : articles.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{a.numero}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{a.designation}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.marque} {a.modele}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{a.lot.nom}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(a.prixUnitaire)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{a.nombreMateriel}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`badge ${a._count.materiels > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                        {a._count.materiels}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(a.dateFinGarantie)}</td>
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
