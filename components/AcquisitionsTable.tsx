'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ChevronRight, ChevronDown, Eye, Pencil, Trash2,
  Check, X, AlertCircle, Package, Layers,
} from 'lucide-react'
import { formatCurrency, formatDate, TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { deleteAcquisition } from '@/app/(dashboard)/acquisitions/actions'

// ─── Types ────────────────────────────────────────────────────

export type AcqLot = {
  id: number
  numero: string
  nom: string
  montant: number
  nombreArticles: number
  societe: { nom: string }
}

export type AcqRow = {
  id: number
  type: string
  code: string
  montant: number
  nombreLots: number
  date: string        // ISO string (serialised from Date by Next.js)
  lots: AcqLot[]
}

// ─── Helpers ──────────────────────────────────────────────────

const TYPE_BADGE: Record<string, string> = {
  MARCHE:          'bg-emerald-100 text-emerald-800',
  BON_DE_COMMANDE: 'bg-blue-100 text-blue-800',
  DON:             'bg-purple-100 text-purple-800',
}

// ─── Component ────────────────────────────────────────────────

export function AcquisitionsTable({ data }: { data: AcqRow[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [confirmId,  setConfirmId]  = useState<number | null>(null)
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleRow(id: number) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function handleDeleteClick(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setErrorMsg(null)
    setConfirmId(id)
  }

  function handleDeleteConfirm(id: number) {
    startTransition(async () => {
      const result = await deleteAcquisition(id)
      if (result.success) {
        setConfirmId(null)
        if (expandedId === id) setExpandedId(null)
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
        <Package size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucune acquisition trouvée</p>
        <p className="text-xs">Modifiez vos filtres ou ajoutez une acquisition</p>
        <Link href="/acquisitions/nouveau" className="btn-primary mt-2">
          + Ajouter une acquisition
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
            {/* Head */}
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-10 px-3 py-3" />
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Montant (MAD)
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Nombre de lots
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-50">
              {data.map((acq) => {
                const isExpanded  = expandedId === acq.id
                const isConfirm   = confirmId  === acq.id

                return (
                  <>
                    {/* ── Main row ──────────────────────────── */}
                    <tr
                      key={`row-${acq.id}`}
                      onClick={() => toggleRow(acq.id)}
                      className={`
                        cursor-pointer select-none transition-colors
                        ${isExpanded
                          ? 'bg-green-50 border-l-[3px] border-l-green-500'
                          : 'hover:bg-gray-50/70'}
                      `}
                    >
                      {/* Chevron */}
                      <td className="px-3 py-3.5">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center transition-colors
                          ${isExpanded ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-400'}
                        `}>
                          {isExpanded
                            ? <ChevronDown  size={13} />
                            : <ChevronRight size={13} />}
                        </div>
                      </td>

                      {/* ID */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          #{acq.id}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5">
                        <span className={`badge text-[11px] ${TYPE_BADGE[acq.type] ?? 'bg-gray-100 text-gray-700'}`}>
                          {TYPE_ACQUISITION_LABELS[acq.type] ?? acq.type}
                        </span>
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm font-bold text-gray-900 font-mono">{acq.code}</span>
                      </td>

                      {/* Montant */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(acq.montant)}
                        </span>
                      </td>

                      {/* Nombre de lots */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <Layers size={12} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-800">
                            {acq.lots.length}
                          </span>
                          {acq.lots.length < acq.nombreLots && (
                            <span className="text-xs text-orange-500">/ {acq.nombreLots}</span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-sm text-gray-600">
                        {formatDate(acq.date)}
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-3.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isConfirm ? (
                          /* Inline delete confirmation */
                          <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                            <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                            <span className="text-xs font-semibold text-red-700 whitespace-nowrap">
                              Supprimer ?
                            </span>
                            <button
                              onClick={() => handleDeleteConfirm(acq.id)}
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
                              href={`/acquisitions/${acq.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Voir les détails"
                            >
                              <Eye size={13} />
                              <span className="hidden lg:inline">Détails</span>
                            </Link>
                            <Link
                              href={`/acquisitions/${acq.id}/modifier`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                              title="Modifier"
                            >
                              <Pencil size={13} />
                              <span className="hidden lg:inline">Modifier</span>
                            </Link>
                            <button
                              onClick={(e) => handleDeleteClick(e, acq.id)}
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

                    {/* ── Expanded lots row ──────────────────── */}
                    {isExpanded && (
                      <tr key={`lots-${acq.id}`} className="bg-green-50/40">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="rounded-xl border border-green-200/70 overflow-hidden shadow-sm">
                            {/* Lots sub-header */}
                            <div className="flex items-center justify-between px-4 py-2.5 bg-green-100/60 border-b border-green-200/60">
                              <p className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                                <Layers size={12} />
                                Lots de l&apos;acquisition&nbsp;
                                <span className="font-mono">{acq.code}</span>
                              </p>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-green-700">
                                  {acq.lots.length} lot(s) enregistré(s) / {acq.nombreLots} prévu(s)
                                </span>
                                <Link
                                  href="/lots/nouveau"
                                  className="text-xs font-semibold text-green-700 hover:text-green-900 hover:underline"
                                >
                                  + Ajouter un lot
                                </Link>
                              </div>
                            </div>

                            {/* Lots table */}
                            {acq.lots.length === 0 ? (
                              <div className="py-6 text-center text-xs text-gray-400 bg-white">
                                Aucun lot enregistré pour cette acquisition.
                              </div>
                            ) : (
                              <table className="min-w-full bg-white text-sm">
                                <thead className="bg-gray-50/80">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">
                                      N° Lot
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">
                                      Intitulé
                                    </th>
                                    <th className="px-4 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase">
                                      Fournisseur
                                    </th>
                                    <th className="px-4 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase">
                                      Montant
                                    </th>
                                    <th className="px-4 py-2 text-center text-[11px] font-semibold text-gray-500 uppercase">
                                      Articles prévus
                                    </th>
                                    <th className="px-4 py-2" />
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {acq.lots.map((lot) => (
                                    <tr key={lot.id} className="hover:bg-gray-50/60 transition-colors">
                                      <td className="px-4 py-2 font-mono font-semibold text-gray-700 text-xs">
                                        {lot.numero}
                                      </td>
                                      <td className="px-4 py-2 font-medium text-gray-800">
                                        {lot.nom}
                                      </td>
                                      <td className="px-4 py-2 text-gray-500">{lot.societe.nom}</td>
                                      <td className="px-4 py-2 text-right font-semibold text-gray-900">
                                        {formatCurrency(lot.montant)}
                                      </td>
                                      <td className="px-4 py-2 text-center text-gray-600">
                                        {lot.nombreArticles}
                                      </td>
                                      <td className="px-4 py-2 text-right">
                                        <Link
                                          href={`/lots?acquisitionId=${acq.id}`}
                                          className="text-xs text-green-700 font-medium hover:underline"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          Voir →
                                        </Link>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
