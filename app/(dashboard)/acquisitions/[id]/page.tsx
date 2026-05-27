import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Package, Pencil, Layers, Calendar,
  CreditCard, Hash, Building2, FileText,
} from 'lucide-react'
import { formatCurrency, formatDate, TYPE_ACQUISITION_LABELS } from '@/lib/utils'

const TYPE_BADGE: Record<string, string> = {
  MARCHE:          'bg-emerald-100 text-emerald-800',
  BON_DE_COMMANDE: 'bg-blue-100 text-blue-800',
  DON:             'bg-purple-100 text-purple-800',
}

export default async function AcquisitionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const acquisition = await prisma.acquisition.findUnique({
    where: { id },
    include: {
      lots: {
        include: {
          societe: true,
          articles: {
            include: { caracteristiques: true },
          },
        },
        orderBy: { numero: 'asc' },
      },
    },
  })

  if (!acquisition) notFound()

  const totalArticlesPrevus = acquisition.lots.reduce((s, l) => s + l.nombreArticles, 0)
  const totalArticlesReels  = acquisition.lots.reduce((s, l) => s + l.articles.length, 0)
  const montantLots         = acquisition.lots.reduce((s, l) => s + l.montant, 0)

  return (
    <>
      <Header title="Détail acquisition" />
      <main className="flex-1 p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/acquisitions"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux acquisitions
          </Link>
          <Link
            href={`/acquisitions/${id}/modifier`}
            className="btn-primary"
          >
            <Pencil size={14} />
            Modifier
          </Link>
        </div>

        {/* ── Header card ──────────────────────────────────── */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Package size={26} className="text-green-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`badge text-xs ${TYPE_BADGE[acquisition.type] ?? 'bg-gray-100 text-gray-700'}`}>
                  {TYPE_ACQUISITION_LABELS[acquisition.type] ?? acquisition.type}
                </span>
                <span className="text-xs text-gray-400 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                  #{acquisition.id}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 font-mono">{acquisition.code}</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Créée le {formatDate(acquisition.createdAt.toISOString())}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <Calendar size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Date</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{formatDate(acquisition.date.toISOString())}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <CreditCard size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Montant</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{formatCurrency(acquisition.montant)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <Layers size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Lots</span>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {acquisition.lots.length}
                <span className="text-gray-400 font-normal"> / {acquisition.nombreLots} prévus</span>
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-gray-400">
                <Hash size={13} />
                <span className="text-xs font-semibold uppercase tracking-wide">Articles</span>
              </div>
              <p className="text-sm font-bold text-gray-800">
                {totalArticlesReels}
                <span className="text-gray-400 font-normal"> / {totalArticlesPrevus} prévus</span>
              </p>
            </div>
          </div>

          {/* Montant discrepancy warning */}
          {montantLots !== acquisition.montant && acquisition.lots.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-start gap-2">
              <FileText size={13} className="mt-0.5 flex-shrink-0" />
              <span>
                Le total des lots ({formatCurrency(montantLots)}) diffère du montant global de l&apos;acquisition ({formatCurrency(acquisition.montant)}).
              </span>
            </div>
          )}
        </div>

        {/* ── Lots ─────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Layers size={16} className="text-green-600" />
              Lots ({acquisition.lots.length})
            </h2>
            <Link href="/lots/nouveau" className="btn-primary">
              + Ajouter un lot
            </Link>
          </div>

          {acquisition.lots.length === 0 ? (
            <div className="card flex flex-col items-center py-12 gap-3 text-gray-400">
              <Layers size={40} className="opacity-20" />
              <p className="text-sm font-medium">Aucun lot enregistré</p>
              <Link href="/lots/nouveau" className="btn-primary mt-1">
                + Ajouter un lot
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {acquisition.lots.map((lot) => (
                <div key={lot.id} className="card">
                  {/* Lot header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                          {lot.numero}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-900">{lot.nom}</h3>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-right">
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Building2 size={11} />
                          Fournisseur
                        </p>
                        <p className="font-semibold text-gray-800">{lot.societe.nom}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <CreditCard size={11} />
                          Montant
                        </p>
                        <p className="font-semibold text-gray-800">{formatCurrency(lot.montant)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Hash size={11} />
                          Articles
                        </p>
                        <p className="font-semibold text-gray-800">
                          {lot.articles.length} / {lot.nombreArticles} prévus
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Articles table */}
                  {lot.articles.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Aucun article enregistré pour ce lot.
                    </p>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">N°</th>
                            <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Désignation</th>
                            <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Marque / Modèle</th>
                            <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase">Prix unit.</th>
                            <th className="px-3 py-2 text-center text-[11px] font-semibold text-gray-500 uppercase">Qté</th>
                            <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">Fin garantie</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                          {lot.articles.map((article) => (
                            <tr key={article.id} className="hover:bg-gray-50/60 transition-colors">
                              <td className="px-3 py-2 font-mono text-xs text-gray-500">{article.numero}</td>
                              <td className="px-3 py-2 font-medium text-gray-800">{article.designation}</td>
                              <td className="px-3 py-2 text-gray-600">
                                {article.marque}
                                {article.modele && (
                                  <span className="text-gray-400"> — {article.modele}</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                {formatCurrency(article.prixUnitaire)}
                              </td>
                              <td className="px-3 py-2 text-center text-gray-700">{article.nombreMateriel}</td>
                              <td className="px-3 py-2 text-gray-600">
                                {article.dateFinGarantie
                                  ? formatDate(article.dateFinGarantie.toISOString())
                                  : <span className="text-gray-300">—</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}
