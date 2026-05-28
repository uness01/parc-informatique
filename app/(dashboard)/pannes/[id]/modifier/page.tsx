import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'
import { updatePanne } from '@/app/(dashboard)/pannes/actions'
import { STATUT_PANNE_LABELS, PRIORITE_LABELS } from '@/lib/utils'

export default async function ModifierPannePage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const panne = await prisma.panne.findUnique({
    where: { id },
    include: { materiel: { include: { article: true } } },
  })
  if (!panne) notFound()

  const action = updatePanne.bind(null, id)

  return (
    <>
      <Header title="Modifier une panne" />
      <main className="flex-1 p-6">

        <Link
          href={`/pannes/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux détails
        </Link>

        <div className="max-w-xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <Wrench size={20} className="text-red-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier la panne</h2>
                <p className="text-xs text-gray-400">
                  {panne.materiel.numeroInventaire} — {panne.materiel.article.designation}
                </p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* Description */}
              <div>
                <label className="label" htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description" name="description" required rows={3}
                  className="input resize-none"
                  defaultValue={panne.description}
                />
              </div>

              {/* Priorité + Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="priorite">
                    Priorité <span className="text-red-500">*</span>
                  </label>
                  <select id="priorite" name="priorite" required className="input" defaultValue={panne.priorite}>
                    {Object.entries(PRIORITE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="statut">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select id="statut" name="statut" required className="input" defaultValue={panne.statut}>
                    {Object.entries(STATUT_PANNE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="label" htmlFor="date">
                  Date de déclaration <span className="text-red-500">*</span>
                </label>
                <input
                  id="date" name="date" type="date" required className="input"
                  defaultValue={panne.date.toISOString().split('T')[0]}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href={`/pannes/${id}`} className="btn-secondary flex-1 justify-center">
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
