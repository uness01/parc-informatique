import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Monitor } from 'lucide-react'
import { updateMateriel } from '@/app/(dashboard)/materiels/actions'
import { STATUT_MATERIEL_LABELS } from '@/lib/utils'

export default async function ModifierMaterielPage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const materiel = await prisma.materiel.findUnique({
    where: { id },
    include: { article: true },
  })
  if (!materiel) notFound()

  const action = updateMateriel.bind(null, id)

  return (
    <>
      <Header title="Modifier un matériel" />
      <main className="flex-1 p-6">

        <Link
          href={`/materiels/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux détails
        </Link>

        <div className="max-w-xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Monitor size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier le matériel</h2>
                <p className="text-xs text-gray-400 font-mono">
                  {materiel.numeroInventaire} — {materiel.article.designation}
                </p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* N° Inventaire (readonly) */}
              <div>
                <label className="label">N° Inventaire</label>
                <input
                  className="input bg-gray-50 text-gray-400 cursor-not-allowed font-mono"
                  value={materiel.numeroInventaire}
                  disabled
                  readOnly
                />
              </div>

              {/* N° Série */}
              <div>
                <label className="label" htmlFor="numeroSerie">
                  N° Série
                  <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
                </label>
                <input
                  id="numeroSerie" name="numeroSerie" className="input font-mono"
                  defaultValue={materiel.numeroSerie ?? ''}
                  placeholder="SN-XXXXXX"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="label" htmlFor="statut">
                  Statut <span className="text-red-500">*</span>
                </label>
                <select id="statut" name="statut" required className="input" defaultValue={materiel.statut}>
                  {Object.entries(STATUT_MATERIEL_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Date fin de garantie */}
              <div>
                <label className="label" htmlFor="dateFinGarantie">
                  Date de fin de garantie
                  <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
                </label>
                <input
                  id="dateFinGarantie" name="dateFinGarantie" type="date" className="input"
                  defaultValue={materiel.dateFinGarantie ? materiel.dateFinGarantie.toISOString().split('T')[0] : ''}
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href={`/materiels/${id}`} className="btn-secondary flex-1 justify-center">
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
