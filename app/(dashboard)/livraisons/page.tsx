import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

export default async function LivraisonsPage({
  searchParams,
}: {
  searchParams: { lotId?: string }
}) {
  const lotId = searchParams.lotId ? Number(searchParams.lotId) : undefined

  const livraisons = await prisma.livraison.findMany({
    where: lotId ? { lotId } : undefined,
    include: {
      lot: { include: { acquisition: true } },
      _count: { select: { materiels: true } },
    },
    orderBy: { dateLivraison: 'desc' },
  })

  return (
    <>
      <Header title="Livraisons" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{livraisons.length} livraison(s)</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N° BL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date de livraison</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lot</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Acquisition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Matériels livrés</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {livraisons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucune livraison enregistrée.
                    </td>
                  </tr>
                ) : livraisons.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{l.numeroBL}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(l.dateLivraison)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{l.lot.nom}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{l.lot.acquisition.code}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-green-700">{l._count.materiels}</td>
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
