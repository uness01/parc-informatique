import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default async function LotsPage({
  searchParams,
}: {
  searchParams: { acquisitionId?: string }
}) {
  const acquisitionId = searchParams.acquisitionId ? Number(searchParams.acquisitionId) : undefined

  const lots = await prisma.lot.findMany({
    where: acquisitionId ? { acquisitionId } : undefined,
    include: {
      acquisition: true,
      societe: true,
      _count: { select: { articles: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Lots" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{lots.length} lot(s)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° Lot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acquisition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Articles prévus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Articles créés</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {lots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucun lot enregistré.
                    </td>
                  </tr>
                ) : lots.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{l.numero}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{l.nom}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{l.acquisition.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.societe.nom}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(l.montant)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{l.nombreArticles}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{l._count.articles}</td>
                    <td className="px-4 py-3">
                      <Link href={`/livraisons?lotId=${l.id}`} className="text-xs text-green-700 font-medium hover:underline">
                        Livraisons
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
