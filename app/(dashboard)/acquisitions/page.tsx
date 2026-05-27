import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { TYPE_ACQUISITION_LABELS, formatDate, formatCurrency } from '@/lib/utils'

export default async function AcquisitionsPage() {
  const acquisitions = await prisma.acquisition.findMany({
    include: { _count: { select: { lots: true } } },
    orderBy: { date: 'desc' },
  })

  return (
    <>
      <Header title="Acquisitions" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{acquisitions.length} acquisition(s)</p>
          <Link href="/acquisitions/nouveau" className="btn-primary">
            <Plus size={16} />
            Nouvelle acquisition
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lots prévus</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Lots créés</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {acquisitions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                      Aucune acquisition enregistrée.
                    </td>
                  </tr>
                ) : acquisitions.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{a.code}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-green-50 text-green-800">
                        {TYPE_ACQUISITION_LABELS[a.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(a.date)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(a.montant)}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{a.nombreLots}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{a._count.lots}</td>
                    <td className="px-4 py-3">
                      <Link href={`/lots?acquisitionId=${a.id}`} className="text-xs text-green-700 font-medium hover:underline">
                        Voir les lots
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
