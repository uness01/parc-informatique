import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wrench } from 'lucide-react'
import { updateReparation } from '@/app/(dashboard)/reparations/actions'
import { STATUT_REPARATION_LABELS } from '@/lib/utils'

export default async function ModifierReparationPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { error?: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const reparation = await prisma.reparation.findUnique({
    where: { id },
    include: { panne: { include: { materiel: { include: { article: true } } } } },
  })
  if (!reparation) notFound()

  const action = updateReparation.bind(null, id)

  return (
    <>
      <Header title="Modifier une réparation" />
      <main className="flex-1 p-6">

        <Link
          href={`/reparations/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux détails
        </Link>

        <div className="max-w-2xl">

          {searchParams.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {decodeURIComponent(searchParams.error)}
            </div>
          )}

          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Wrench size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier la réparation</h2>
                <p className="text-xs text-gray-400 font-mono">{reparation.codeBon}</p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* Code bon */}
              <div>
                <label className="label" htmlFor="codeBon">
                  Code bon <span className="text-red-500">*</span>
                </label>
                <input
                  id="codeBon" name="codeBon" required className="input font-mono"
                  defaultValue={reparation.codeBon}
                />
              </div>

              {/* Type + Statut */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="typeMaintenance">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select id="typeMaintenance" name="typeMaintenance" required className="input" defaultValue={reparation.typeMaintenance}>
                    <option value="CORRECTIVE">Corrective</option>
                    <option value="PREVENTIVE">Préventive</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="statut">
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select id="statut" name="statut" required className="input" defaultValue={reparation.statut}>
                    {Object.entries(STATUT_REPARATION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="dateDebut">
                    Date de début <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dateDebut" name="dateDebut" type="date" required className="input"
                    defaultValue={reparation.dateDebut.toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="dateFin">
                    Date de fin
                    <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
                  </label>
                  <input
                    id="dateFin" name="dateFin" type="date" className="input"
                    defaultValue={reparation.dateFin ? reparation.dateFin.toISOString().split('T')[0] : ''}
                  />
                </div>
              </div>

              {/* Coût */}
              <div>
                <label className="label" htmlFor="cout">
                  Coût (MAD)
                  <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
                </label>
                <div className="relative">
                  <input
                    id="cout" name="cout" type="number" step="0.01" min="0"
                    className="input pr-14"
                    defaultValue={reparation.cout ?? ''}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                </div>
              </div>

              {/* Rapport */}
              <div>
                <label className="label" htmlFor="rapport">
                  Rapport d&apos;intervention
                  <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
                </label>
                <textarea
                  id="rapport" name="rapport" rows={4} className="input resize-none"
                  defaultValue={reparation.rapport ?? ''}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href={`/reparations/${id}`} className="btn-secondary flex-1 justify-center">
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
