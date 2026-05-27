import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, UserCheck } from 'lucide-react'
import { AffectationForm } from '@/components/AffectationForm'

export default async function NouvelleAffectationPage({
  searchParams,
}: {
  searchParams: { materielId?: string }
}) {
  const defaultMaterielId = searchParams.materielId ? Number(searchParams.materielId) : undefined

  const [materiels, utilisateurs] = await Promise.all([
    prisma.materiel.findMany({
      where:   { statut: 'DISPONIBLE' },
      include: { article: { select: { designation: true, marque: true, modele: true } } },
      orderBy: { numeroInventaire: 'asc' },
    }),
    prisma.utilisateur.findMany({
      where:   { actif: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      select:  { id: true, nom: true, prenom: true, email: true },
    }),
  ])

  const materielOptions = materiels.map((m) => ({
    id:              m.id,
    numeroInventaire: m.numeroInventaire,
    numeroSerie:     m.numeroSerie,
    statut:          m.statut,
    article: {
      designation: m.article.designation,
      marque:      m.article.marque,
      modele:      m.article.modele,
    },
  }))

  return (
    <>
      <Header title="Nouvelle affectation" />
      <main className="flex-1 p-6">

        {/* Breadcrumb */}
        <Link
          href="/affectations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux affectations
        </Link>

        <div className="max-w-2xl">
          <div className="card">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <UserCheck size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Enregistrer une affectation</h2>
                <p className="text-xs text-gray-400">Affecter un matériel disponible à un bénéficiaire</p>
              </div>
            </div>

            <AffectationForm
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
