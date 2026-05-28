'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Pencil, Trash2, Check, X, AlertCircle, Truck,
  PackageCheck, PackageX,
} from 'lucide-react'
import { formatDate, TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { deleteLivraison } from '@/app/(dashboard)/livraisons/actions'

// ─── Types ────────────────────────────────────────────────────

export type LivraisonRow = {
  id: number
  numeroBL: string
  dateLivraison: string
  articleLivre: boolean
  materielsCount: number
  lot: {
    id: number
    numero: string
    nom: string
    articlesCount: number
    firstArticle: string | null
  }
  acquisition: {
    id: number
    code: string
    type: string
    date: string
  }
}

// ─── Helpers ──────────────────────────────────────────────────

const ACQ_TYPE_BADGE: Record<string, string> = {
  MARCHE:          'bg-emerald-100 text-emerald-800',
  BON_DE_COMMANDE: 'bg-blue-100 text-blue-800',
  DON:             'bg-purple-100 text-purple-800',
}

// ─── Component ────────────────────────────────────────────────

export function LivraisonsTable({
  data,
  canModifier  = true,
  canSupprimer = true,
}: {
  data: LivraisonRow[]
  canModifier?:  boolean
  canSupprimer?: boolean
}) {
  const [confirmId,  setConfirmId]  = useState<number | null>(null)
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDeleteClick(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setErrorMsg(null)
    setConfirmId(id)
  }

  function handleDeleteConfirm(id: number) {
    startTransition(async () => {
      const result = await deleteLivraison(id)
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
        <Truck size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucune livraison trouvée</p>
        <p className="text-xs">Modifiez vos filtres ou ajoutez une livraison</p>
        <Link href="/livraisons/nouveau" className="btn-primary mt-2">
          + Ajouter une livraison
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
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acquisition</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date Acq.</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Lot</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Article</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Classification</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nbre mat.</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Livré</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date livr.</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">N° BL</th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {data.map((liv) => {
                const isConfirm = confirmId === liv.id
                const articleLabel = liv.lot.firstArticle
                  ? liv.lot.articlesCount > 1
                    ? `${liv.lot.firstArticle} +${liv.lot.articlesCount - 1}`
                    : liv.lot.firstArticle
                  : `${liv.lot.articlesCount} article(s)`

                return (
                  <tr key={liv.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* ID */}
                    <td className="px-3 py-3.5">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{liv.id}
                      </span>
                    </td>

                    {/* Acquisition */}
                    <td className="px-3 py-3.5">
                      <Link
                        href={`/acquisitions/${liv.acquisition.id}`}
                        className="text-sm font-mono font-semibold text-gray-900 hover:text-green-700 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {liv.acquisition.code}
                      </Link>
                    </td>

                    {/* Date Acquisition */}
                    <td className="px-3 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(liv.acquisition.date)}
                    </td>

                    {/* Lot */}
                    <td className="px-3 py-3.5">
                      <p className="text-sm font-mono font-bold text-gray-900">{liv.lot.numero}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[9rem]">{liv.lot.nom}</p>
                    </td>

                    {/* Article */}
                    <td className="px-3 py-3.5">
                      {liv.lot.articlesCount === 0 ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : (
                        <p className="text-xs text-gray-700 max-w-[10rem] truncate" title={articleLabel}>
                          {articleLabel}
                        </p>
                      )}
                    </td>

                    {/* Classification (type) */}
                    <td className="px-3 py-3.5">
                      <span className={`badge text-[10px] ${ACQ_TYPE_BADGE[liv.acquisition.type] ?? 'bg-gray-100 text-gray-700'}`}>
                        {TYPE_ACQUISITION_LABELS[liv.acquisition.type] ?? liv.acquisition.type}
                      </span>
                    </td>

                    {/* Nombre matériels */}
                    <td className="px-3 py-3.5 text-center">
                      <span className={`text-sm font-semibold ${
                        liv.materielsCount > 0 ? 'text-green-700' : 'text-gray-400'
                      }`}>
                        {liv.materielsCount}
                      </span>
                    </td>

                    {/* Article livré */}
                    <td className="px-3 py-3.5 text-center">
                      {liv.articleLivre ? (
                        <span className="inline-flex items-center gap-1 badge bg-green-100 text-green-800 text-[10px]">
                          <PackageCheck size={9} />
                          Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 badge bg-gray-100 text-gray-500 text-[10px]">
                          <PackageX size={9} />
                          Non
                        </span>
                      )}
                    </td>

                    {/* Date livraison */}
                    <td className="px-3 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(liv.dateLivraison)}
                    </td>

                    {/* N° BL */}
                    <td className="px-3 py-3.5">
                      <span className="text-sm font-mono font-semibold text-gray-800">{liv.numeroBL}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {isConfirm ? (
                        <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Supprimer ?</span>
                          <button
                            onClick={() => handleDeleteConfirm(liv.id)}
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
                          {canModifier && (
                            <Link
                              href={`/livraisons/${liv.id}/modifier`}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                              title="Modifier"
                            >
                              <Pencil size={13} />
                              <span className="hidden xl:inline">Modifier</span>
                            </Link>
                          )}
                          {canSupprimer && (
                            <button
                              onClick={(e) => handleDeleteClick(e, liv.id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
                              <span className="hidden xl:inline">Supprimer</span>
                            </button>
                          )}
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
