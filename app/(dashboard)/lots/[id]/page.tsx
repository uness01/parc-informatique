import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Layers, Pencil, Building2, CreditCard,
  Hash, Tag, ShieldCheck, ShieldOff, Settings2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default async function LotDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const lot = await prisma.lot.findUnique({
    where: { id },
    include: {
      acquisition: true,
      societe:     true,
      articles: {
        include: { caracteristiques: true, _count: { select: { materiels: true } } },
        orderBy: { numero: 'asc' },
      },
      livraisons: { orderBy: { dateLivraison: 'asc' } },
    },
  })
  if (!lot) notFound()

  const today = new Date()

  return (
    <>
      <Header title={`Lot ${lot.numero}`} />
      <main className="flex-1 p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/lots"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux lots
          </Link>
          <Link href={`/lots/${id}/modifier`} className="btn-primary">
            <Pencil size={14} />
            Modifier
          </Link>
        </div>

        {/* Header card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Layers size={26} className="text-green-700" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                  {lot.numero}
                </span>
                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                  #{lot.id}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{lot.nom}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <CreditCard size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Montant</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{formatCurrency(lot.montant)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <Hash size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Articles</span>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {lot.articles.length}
                <span className="text-gray-400 font-normal"> / {lot.nombreArticles} prévus</span>
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <Building2 size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Fournisseur</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{lot.societe.nom}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <Tag size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Acquisition</span>
              </div>
              <Link
                href={`/acquisitions/${lot.acquisition.id}`}
                className="text-sm font-bold text-green-700 hover:underline font-mono"
              >
                {lot.acquisition.code}
              </Link>
            </div>
          </div>
        </div>

        {/* Articles */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Tag size={16} className="text-purple-600" />
              Articles ({lot.articles.length})
            </h2>
            <Link href="/articles/nouveau" className="btn-primary">
              + Ajouter un article
            </Link>
          </div>

          {lot.articles.length === 0 ? (
            <div className="card flex flex-col items-center py-12 gap-3 text-gray-400">
              <Tag size={40} className="opacity-20" />
              <p className="text-sm font-medium">Aucun article dans ce lot</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">N°</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Désignation</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Marque / Modèle</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">P.U (MAD)</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Qté</th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase">Matériels</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase">Garantie</th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {lot.articles.map((art) => {
                      const isEnGarantie = art.dateFinGarantie ? art.dateFinGarantie > today : false
                      return (
                        <tr key={art.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs text-gray-500">{art.numero}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{art.designation}</td>
                          <td className="px-4 py-3 text-gray-600">
                            <p className="font-semibold">{art.marque}</p>
                            <p className="text-xs text-gray-400">{art.modele}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-gray-900">
                            {formatCurrency(art.prixUnitaire)}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-800">
                            {art.nombreMateriel}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-700">
                            {art._count.materiels}
                          </td>
                          <td className="px-4 py-3">
                            {art.dateFinGarantie ? (
                              <div className="flex flex-col gap-0.5">
                                <span className={`badge text-[10px] w-fit flex items-center gap-1 ${isEnGarantie ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                                  {isEnGarantie ? <ShieldCheck size={9} /> : <ShieldOff size={9} />}
                                  {isEnGarantie ? 'En garantie' : 'Expirée'}
                                </span>
                                <span className="text-[11px] text-gray-400">{formatDate(art.dateFinGarantie.toISOString())}</span>
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link
                                href={`/articles/${art.id}/caracteristiques`}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                                title="Caractéristiques"
                              >
                                <Settings2 size={13} />
                                {art.caracteristiques.length > 0 && (
                                  <span className="bg-purple-100 text-purple-700 rounded-full text-[10px] px-1.5 font-bold leading-tight">
                                    {art.caracteristiques.length}
                                  </span>
                                )}
                              </Link>
                              <Link
                                href={`/articles/${art.id}/modifier`}
                                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                                title="Modifier"
                              >
                                <Pencil size={13} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
