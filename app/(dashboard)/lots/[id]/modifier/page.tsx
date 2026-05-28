import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Layers } from 'lucide-react'
import { updateLot } from '@/app/(dashboard)/lots/actions'

export default async function ModifierLotPage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [lot, acquisitions, societes] = await Promise.all([
    prisma.lot.findUnique({ where: { id }, include: { acquisition: true, societe: true } }),
    prisma.acquisition.findMany({ orderBy: { date: 'desc' }, select: { id: true, code: true } }),
    prisma.societe.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true } }),
  ])
  if (!lot) notFound()

  const action = updateLot.bind(null, id)

  return (
    <>
      <Header title="Modifier un lot" />
      <main className="flex-1 p-6">

        <Link
          href={`/lots/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux détails
        </Link>

        <div className="max-w-xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <Layers size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier le lot</h2>
                <p className="text-xs text-gray-400 font-mono">{lot.numero}</p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* Acquisition */}
              <div>
                <label className="label" htmlFor="acquisitionId">
                  Acquisition <span className="text-red-500">*</span>
                </label>
                <select id="acquisitionId" name="acquisitionId" required className="input" defaultValue={lot.acquisitionId}>
                  {acquisitions.map((a) => (
                    <option key={a.id} value={a.id}>{a.code}</option>
                  ))}
                </select>
              </div>

              {/* Numéro + Nom */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="numero">
                    Numéro <span className="text-red-500">*</span>
                  </label>
                  <input id="numero" name="numero" required className="input font-mono" defaultValue={lot.numero} />
                </div>
                <div>
                  <label className="label" htmlFor="nom">
                    Nom du lot <span className="text-red-500">*</span>
                  </label>
                  <input id="nom" name="nom" required className="input" defaultValue={lot.nom} />
                </div>
              </div>

              {/* Société */}
              <div>
                <label className="label" htmlFor="societeId">
                  Société / Fournisseur <span className="text-red-500">*</span>
                </label>
                <select id="societeId" name="societeId" required className="input" defaultValue={lot.societeId}>
                  {societes.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>

              {/* Montant + Nb articles */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="montant">
                    Montant (MAD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="montant" name="montant" type="number" step="0.01" min="0"
                      required className="input pr-14" defaultValue={lot.montant}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">MAD</span>
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="nombreArticles">
                    Nb articles prévus <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombreArticles" name="nombreArticles" type="number" min="1"
                    required className="input" defaultValue={lot.nombreArticles}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href={`/lots/${id}`} className="btn-secondary flex-1 justify-center">
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
