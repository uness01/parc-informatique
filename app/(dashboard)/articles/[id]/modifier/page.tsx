import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import { updateArticle } from '@/app/(dashboard)/articles/actions'

export default async function ModifierArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [article, lots] = await Promise.all([
    prisma.article.findUnique({ where: { id }, include: { lot: true } }),
    prisma.lot.findMany({ orderBy: { numero: 'asc' }, select: { id: true, numero: true, nom: true } }),
  ])
  if (!article) notFound()

  const action = updateArticle.bind(null, id)

  return (
    <>
      <Header title="Modifier un article" />
      <main className="flex-1 p-6">

        <Link
          href={`/articles/${id}/caracteristiques`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux caractéristiques
        </Link>

        <div className="max-w-xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Tag size={20} className="text-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier l&apos;article</h2>
                <p className="text-xs text-gray-400 font-mono">{article.numero} — {article.designation}</p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* Lot */}
              <div>
                <label className="label" htmlFor="lotId">
                  Lot <span className="text-red-500">*</span>
                </label>
                <select id="lotId" name="lotId" required className="input" defaultValue={article.lotId}>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>{l.numero} — {l.nom}</option>
                  ))}
                </select>
              </div>

              {/* Numéro + Désignation */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="numero">
                    Numéro <span className="text-red-500">*</span>
                  </label>
                  <input id="numero" name="numero" required className="input font-mono" defaultValue={article.numero} />
                </div>
                <div>
                  <label className="label" htmlFor="designation">
                    Désignation <span className="text-red-500">*</span>
                  </label>
                  <input id="designation" name="designation" required className="input" defaultValue={article.designation} />
                </div>
              </div>

              {/* Marque + Modèle */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="marque">
                    Marque <span className="text-red-500">*</span>
                  </label>
                  <input id="marque" name="marque" required className="input" defaultValue={article.marque} />
                </div>
                <div>
                  <label className="label" htmlFor="modele">
                    Modèle <span className="text-red-500">*</span>
                  </label>
                  <input id="modele" name="modele" required className="input" defaultValue={article.modele} />
                </div>
              </div>

              {/* Prix unitaire + Nombre matériels */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="prixUnitaire">
                    Prix unitaire (MAD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="prixUnitaire" name="prixUnitaire" type="number" step="0.01" min="0"
                      required className="input pr-14" defaultValue={article.prixUnitaire}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="nombreMateriel">
                    Qté prévue <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombreMateriel" name="nombreMateriel" type="number" min="1"
                    required className="input" defaultValue={article.nombreMateriel}
                  />
                </div>
              </div>

              {/* Date de fin de garantie */}
              <div>
                <label className="label" htmlFor="dateFinGarantie">
                  Date de fin de garantie
                  <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
                </label>
                <input
                  id="dateFinGarantie" name="dateFinGarantie" type="date" className="input"
                  defaultValue={article.dateFinGarantie ? article.dateFinGarantie.toISOString().split('T')[0] : ''}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href={`/articles/${id}/caracteristiques`} className="btn-secondary flex-1 justify-center">
                  Annuler
                </Link>
              </div>

            </form>
          </div>
        </div>
      </main>
    </>
  )
}
