'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Pencil, Trash2, Check, X, AlertCircle, Tag, Settings2, ShieldCheck, ShieldOff,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { deleteArticle } from '@/app/(dashboard)/articles/actions'

// ─── Types ────────────────────────────────────────────────────

export type ArticleRow = {
  id: number
  numero: string
  designation: string
  marque: string
  modele: string
  nombreMateriel: number
  prixUnitaire: number
  dateFinGarantie: string | null
  caracteristiquesCount: number
  lot: { id: number; numero: string; nom: string }
}

// ─── Component ────────────────────────────────────────────────

export function ArticlesTable({ data }: { data: ArticleRow[] }) {
  const [confirmId,  setConfirmId]  = useState<number | null>(null)
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const today = new Date()

  function handleDeleteClick(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setErrorMsg(null)
    setConfirmId(id)
  }

  function handleDeleteConfirm(id: number) {
    startTransition(async () => {
      const result = await deleteArticle(id)
      if (result.success) {
        setConfirmId(null)
      } else {
        setConfirmId(null)
        setErrorMsg(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Tag size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucun article trouvé</p>
        <p className="text-xs">Modifiez vos filtres ou ajoutez un article</p>
        <Link href="/articles/nouveau" className="btn-primary mt-2">
          + Ajouter un article
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Numéro</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Désignation</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Marque / Modèle</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Lot</th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nbre mat.</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">P.U (MAD)</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Garantie</th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {data.map((article) => {
                const isConfirm    = confirmId === article.id
                const isEnGarantie = article.dateFinGarantie
                  ? new Date(article.dateFinGarantie) > today
                  : false

                return (
                  <tr key={article.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{article.id}
                      </span>
                    </td>

                    {/* Numéro */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold font-mono text-gray-900">{article.numero}</span>
                    </td>

                    {/* Désignation */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-800">{article.designation}</span>
                    </td>

                    {/* Marque / Modèle */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-gray-900">{article.marque}</p>
                      <p className="text-xs text-gray-500">{article.modele}</p>
                    </td>

                    {/* Lot */}
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/lots/${article.lot.id}`}
                        className="text-sm font-mono font-semibold text-gray-700 hover:text-green-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {article.lot.numero}
                      </Link>
                      <p className="text-xs text-gray-400 truncate max-w-[10rem]">{article.lot.nom}</p>
                    </td>

                    {/* Nombre matériel */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-semibold text-gray-800">{article.nombreMateriel}</span>
                    </td>

                    {/* P.U */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(article.prixUnitaire)}</span>
                    </td>

                    {/* Garantie */}
                    <td className="px-4 py-3.5">
                      {article.dateFinGarantie ? (
                        <div className="flex flex-col gap-0.5">
                          <span className={`badge text-[10px] w-fit flex items-center gap-1 ${
                            isEnGarantie ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {isEnGarantie
                              ? <ShieldCheck size={9} />
                              : <ShieldOff size={9} />}
                            {isEnGarantie ? 'En garantie' : 'Expirée'}
                          </span>
                          <span className="text-[11px] text-gray-400">{formatDate(article.dateFinGarantie)}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isConfirm ? (
                        <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Supprimer ?</span>
                          <button
                            onClick={() => handleDeleteConfirm(article.id)}
                            disabled={isPending}
                            className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            <Check size={10} />
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            disabled={isPending}
                            className="w-5 h-5 rounded bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-0.5">
                          <Link
                            href={`/articles/${article.id}/caracteristiques`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Caractéristiques"
                          >
                            <Settings2 size={13} />
                            <span className="hidden xl:inline">Caract.</span>
                            {article.caracteristiquesCount > 0 && (
                              <span className="bg-purple-100 text-purple-700 rounded-full text-[10px] px-1.5 font-bold leading-tight">
                                {article.caracteristiquesCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            href={`/articles/${article.id}/modifier`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                            <span className="hidden xl:inline">Modifier</span>
                          </Link>
                          <button
                            onClick={(e) => handleDeleteClick(e, article.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                            <span className="hidden xl:inline">Supprimer</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
