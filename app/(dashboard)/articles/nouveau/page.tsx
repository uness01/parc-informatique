import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { ArticleForm } from '@/components/ArticleForm'

export default async function NouvelArticlePage({
  searchParams,
}: {
  searchParams: { lotId?: string }
}) {
  const [lots, combos] = await Promise.all([
    prisma.lot.findMany({
      orderBy: { createdAt: 'desc' },
      include: { acquisition: { select: { code: true } } },
    }),
    // Fetch all (designation, marque, modele) combos for cascading
    prisma.article.findMany({
      select: { designation: true, marque: true, modele: true },
    }),
  ])

  // Deduplicate combos
  const seen     = new Set<string>()
  const combinations = combos.filter((c) => {
    const key = `${c.designation}||${c.marque}||${c.modele}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const designations = Array.from(new Set(combos.map((c) => c.designation))).sort()
  const marques      = Array.from(new Set(combos.map((c) => c.marque))).sort()

  const lotRows = lots.map((l) => ({
    id:              l.id,
    numero:          l.numero,
    nom:             l.nom,
    acquisitionCode: l.acquisition.code,
  }))

  const defaultLotId = searchParams.lotId ? parseInt(searchParams.lotId) : undefined

  return (
    <>
      <Header title="Ajouter un article" />
      <main className="flex-1 p-6">

        {/* Breadcrumb */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux articles
        </Link>

        <div className="max-w-xl">
          <div className="card">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Tag size={20} className="text-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Nouvel article</h2>
                <p className="text-xs text-gray-400">Renseignez les informations de l&apos;article</p>
              </div>
            </div>

            <ArticleForm
              lots={lotRows}
              designations={designations}
              marques={marques}
              combinations={combinations}
              defaultLotId={defaultLotId}
            />
          </div>
        </div>
      </main>
    </>
  )
}
