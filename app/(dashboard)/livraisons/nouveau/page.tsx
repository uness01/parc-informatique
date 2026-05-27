import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Truck } from 'lucide-react'
import { LivraisonForm } from '@/components/LivraisonForm'

export default async function NouvelleLivraisonPage() {
  const acquisitions = await prisma.acquisition.findMany({
    orderBy: { date: 'desc' },
    include: {
      lots: {
        orderBy: { numero: 'asc' },
        include: {
          _count: { select: { articles: true } },
        },
      },
    },
  })

  // Serialize dates for client component
  const acquisitionRows = acquisitions.map((a) => ({
    id:   a.id,
    code: a.code,
    type: a.type,
    date: a.date.toISOString(),
    lots: a.lots.map((l) => ({
      id:            l.id,
      numero:        l.numero,
      nom:           l.nom,
      montant:       l.montant,
      articlesCount: l._count.articles,
    })),
  }))

  return (
    <>
      <Header title="Ajouter une livraison" />
      <main className="flex-1 p-6">

        {/* Breadcrumb */}
        <Link
          href="/livraisons"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux livraisons
        </Link>

        <div className="max-w-xl">
          <div className="card">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nouvelle livraison</h2>
                <p className="text-xs text-gray-400">Enregistrez un bon de livraison</p>
              </div>
            </div>

            <LivraisonForm acquisitions={acquisitionRows} />
          </div>
        </div>
      </main>
    </>
  )
}
