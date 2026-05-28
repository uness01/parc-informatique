import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Truck } from 'lucide-react'
import { updateLivraison } from '@/app/(dashboard)/livraisons/actions'

export default async function ModifierLivraisonPage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [livraison, lots] = await Promise.all([
    prisma.livraison.findUnique({ where: { id }, include: { lot: true } }),
    prisma.lot.findMany({ orderBy: { numero: 'asc' }, select: { id: true, numero: true, nom: true } }),
  ])
  if (!livraison) notFound()

  const action = updateLivraison.bind(null, id)

  return (
    <>
      <Header title="Modifier une livraison" />
      <main className="flex-1 p-6">

        <Link
          href="/livraisons"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux livraisons
        </Link>

        <div className="max-w-xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier la livraison</h2>
                <p className="text-xs text-gray-400 font-mono">{livraison.numeroBL}</p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* Lot */}
              <div>
                <label className="label" htmlFor="lotId">
                  Lot <span className="text-red-500">*</span>
                </label>
                <select id="lotId" name="lotId" required className="input" defaultValue={livraison.lotId}>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>{l.numero} — {l.nom}</option>
                  ))}
                </select>
              </div>

              {/* N° BL */}
              <div>
                <label className="label" htmlFor="numeroBL">
                  Numéro de BL <span className="text-red-500">*</span>
                </label>
                <input
                  id="numeroBL" name="numeroBL" required className="input font-mono"
                  placeholder="BL-2024-001" defaultValue={livraison.numeroBL}
                />
              </div>

              {/* Date livraison */}
              <div>
                <label className="label" htmlFor="dateLivraison">
                  Date de livraison <span className="text-red-500">*</span>
                </label>
                <input
                  id="dateLivraison" name="dateLivraison" type="date" required className="input"
                  defaultValue={livraison.dateLivraison.toISOString().split('T')[0]}
                />
              </div>

              {/* Article livré */}
              <div>
                <label className="label">Article livré</label>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="articleLivre" value="oui"
                      defaultChecked={livraison.articleLivre}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-700">Oui — reçu</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio" name="articleLivre" value="non"
                      defaultChecked={!livraison.articleLivre}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-gray-700">Non — en attente</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href="/livraisons" className="btn-secondary flex-1 justify-center">
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
