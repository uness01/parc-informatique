import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Layers } from 'lucide-react'
import { LotForm } from '@/components/LotForm'

export default async function NouveauLotPage({
  searchParams,
}: {
  searchParams: { acquisitionId?: string }
}) {
  const [acquisitions, societes] = await Promise.all([
    prisma.acquisition.findMany({
      orderBy: { date: 'desc' },
      select: { id: true, code: true, date: true },
    }),
    prisma.societe.findMany({
      orderBy: { nom: 'asc' },
      select: { id: true, nom: true },
    }),
  ])

  const defaultAcquisitionId = searchParams.acquisitionId
    ? parseInt(searchParams.acquisitionId)
    : undefined

  // Serialize dates for client component
  const acquisitionRows = acquisitions.map((a) => ({
    id:   a.id,
    code: a.code,
    date: a.date.toISOString(),
  }))

  return (
    <>
      <Header title="Ajouter un lot" />
      <main className="flex-1 p-6">

        {/* Breadcrumb */}
        <Link
          href="/lots"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux lots
        </Link>

        <div className="max-w-xl">
          <div className="card">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Layers size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nouveau lot</h2>
                <p className="text-xs text-gray-400">Renseignez les informations du lot</p>
              </div>
            </div>

            <LotForm
              acquisitions={acquisitionRows}
              societes={societes}
              defaultAcquisitionId={defaultAcquisitionId}
            />
          </div>
        </div>
      </main>
    </>
  )
}
