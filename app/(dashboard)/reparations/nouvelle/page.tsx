import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'
import { ReparationForm } from '@/components/ReparationForm'

export default async function NouvelleReparationPage({
  searchParams,
}: {
  searchParams: { panneId?: string }
}) {
  const defaultPanneId = searchParams.panneId ? Number(searchParams.panneId) : undefined

  const [pannes, techniciens, societes] = await Promise.all([
    prisma.panne.findMany({
      where:   { statut: { in: ['OUVERTE', 'EN_COURS'] } },
      include: { materiel: { include: { article: { select: { designation: true } } } } },
      orderBy: { date: 'desc' },
    }),
    prisma.utilisateur.findMany({
      where:   { role: { in: ['TECHNICIEN', 'ADMIN'] }, actif: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      select:  { id: true, nom: true, prenom: true },
    }),
    prisma.societe.findMany({
      orderBy: { nom: 'asc' },
      select:  { id: true, nom: true },
    }),
  ])

  const panneOptions = pannes.map((p) => ({
    id:          p.id,
    description: p.description,
    materiel: {
      id:               p.materiel.id,
      numeroInventaire: p.materiel.numeroInventaire,
      article: { designation: p.materiel.article.designation },
    },
  }))

  return (
    <>
      <Header title="Nouvelle réparation" />
      <main className="flex-1 p-6">

        <Link
          href="/reparations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux réparations
        </Link>

        <div className="max-w-2xl">
          <div className="card">

            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Wrench size={20} className="text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Enregistrer une réparation</h2>
                <p className="text-xs text-gray-400">Associer une panne à une intervention de maintenance</p>
              </div>
            </div>

            <ReparationForm
              pannes={panneOptions}
              techniciens={techniciens}
              societes={societes}
              defaultPanneId={defaultPanneId}
            />

          </div>
        </div>

      </main>
    </>
  )
}
