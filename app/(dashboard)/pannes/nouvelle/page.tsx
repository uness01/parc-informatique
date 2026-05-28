import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'
import { PanneForm } from '@/components/PanneForm'

export default async function NouvellePannePage({
  searchParams,
}: {
  searchParams: { materielId?: string }
}) {
  const defaultMaterielId = searchParams.materielId ? Number(searchParams.materielId) : undefined

  const [materiels, utilisateurs] = await Promise.all([
    prisma.materiel.findMany({
      include: { article: { select: { designation: true, marque: true } } },
      orderBy: { numeroInventaire: 'asc' },
    }),
    prisma.utilisateur.findMany({
      where:   { actif: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      select:  { id: true, nom: true, prenom: true },
    }),
  ])

  const materielOptions = materiels.map((m) => ({
    id:               m.id,
    numeroInventaire: m.numeroInventaire,
    article: {
      designation: m.article.designation,
      marque:      m.article.marque,
    },
  }))

  return (
    <>
      <Header title="Déclarer une panne" />
      <main className="flex-1 p-6">

        <Link
          href="/pannes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux pannes
        </Link>

        <div className="max-w-2xl">
          <div className="card">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Wrench size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Déclarer une panne</h2>
                <p className="text-xs text-gray-400">Enregistrer un incident ou dysfonctionnement matériel</p>
              </div>
            </div>

            <PanneForm
              materiels={materielOptions}
              utilisateurs={utilisateurs}
              defaultMaterielId={defaultMaterielId}
            />

          </div>
        </div>

      </main>
    </>
  )
}
