'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Eye, Pencil, Trash2, Check, X, AlertCircle, Layers,
} from 'lucide-react'
import { formatCurrency, TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { deleteLot } from '@/app/(dashboard)/lots/actions'

// ─── Types ────────────────────────────────────────────────────

export type LotRow = {
  id: number
  numero: string
  nom: string
  montant: number
  nombreArticles: number
  articlesCount: number
  acquisition: { id: number; code: string; type: string }
  societe: { nom: string }
}

// ─── Helpers ──────────────────────────────────────────────────

const ACQ_TYPE_BADGE: Record<string, string> = {
  MARCHE:          'bg-emerald-100 text-emerald-800',
  BON_DE_COMMANDE: 'bg-blue-100 text-blue-800',
  DON:             'bg-purple-100 text-purple-800',
}

// ─── Component ────────────────────────────────────────────────

export function LotsTable({ data }: { data: LotRow[] }) {
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
      const result = await deleteLot(id)
      if (result.success) {
        setConfirmId(null)
      } else {
        setConfirmId(null)
        setErrorMsg(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  // ── Empty state ─────────────────────────────────────────────
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Layers size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucun lot trouvé</p>
        <p className="text-xs">Modifiez vos filtres ou ajoutez un lot</p>
        <Link href="/lots/nouveau" className="btn-primary mt-2">
          + Ajouter un lot
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Numéro
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Nom du lot
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Acquisition
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Société
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Montant (MAD)
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Articles
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {data.map((lot) => {
                const isConfirm = confirmId === lot.id

                return (
                  <tr key={lot.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* ID */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{lot.id}
                      </span>
                    </td>

                    {/* Numéro */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold font-mono text-gray-900">{lot.numero}</span>
                    </td>

                    {/* Nom */}
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-gray-800">{lot.nom}</span>
                    </td>

                    {/* Acquisition */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={`/acquisitions/${lot.acquisition.id}`}
                          className="text-sm font-mono font-semibold text-gray-900 hover:text-green-700 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lot.acquisition.code}
                        </Link>
                        <span className={`badge text-[10px] w-fit ${ACQ_TYPE_BADGE[lot.acquisition.type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {TYPE_ACQUISITION_LABELS[lot.acquisition.type] ?? lot.acquisition.type}
                        </span>
                      </div>
                    </td>

                    {/* Société */}
                    <td className="px-4 py-3.5 text-sm text-gray-600">{lot.societe.nom}</td>

                    {/* Montant */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(lot.montant)}
                      </span>
                    </td>

                    {/* Articles */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm font-semibold text-gray-800">
                        {lot.articlesCount}
                      </span>
                      {lot.articlesCount < lot.nombreArticles && (
                        <span className="text-xs text-orange-500"> / {lot.nombreArticles}</span>
                      )}
                      {lot.articlesCount >= lot.nombreArticles && lot.nombreArticles > 0 && (
                        <span className="text-xs text-gray-400"> / {lot.nombreArticles}</span>
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
                          <span className="text-xs font-semibold text-red-700 whitespace-nowrap">
                            Supprimer ?
                          </span>
                          <button
                            onClick={() => handleDeleteConfirm(lot.id)}
                            disabled={isPending}
                            className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors"
                            title="Confirmer la suppression"
                          >
                            <Check size={10} />
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            disabled={isPending}
                            className="w-5 h-5 rounded bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                            title="Annuler"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-0.5">
                          <Link
                            href={`/lots/${lot.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Voir les détails"
                          >
                            <Eye size={13} />
                            <span className="hidden lg:inline">Détails</span>
                          </Link>
                          <Link
                            href={`/lots/${lot.id}/modifier`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={13} />
                            <span className="hidden lg:inline">Modifier</span>
                          </Link>
                          <button
                            onClick={(e) => handleDeleteClick(e, lot.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                            <span className="hidden lg:inline">Supprimer</span>
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
