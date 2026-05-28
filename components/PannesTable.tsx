'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle, Check, Eye, Trash2, X, Wrench,
} from 'lucide-react'
import {
  STATUT_PANNE_LABELS, STATUT_PANNE_COLORS,
  PRIORITE_LABELS, PRIORITE_COLORS,
  formatDate,
} from '@/lib/utils'
import { updatePanneStatut, deletePanne } from '@/app/(dashboard)/pannes/actions'

// ─── Types ────────────────────────────────────────────────────

export type PanneRow = {
  id: number
  description: string
  priorite: string
  statut: string
  date: string
  reparationsCount: number
  materiel: {
    id: number
    numeroInventaire: string
    article: { designation: string; marque: string }
  }
  utilisateur: { nom: string; prenom: string }
}

// ─── Statut badge-select ──────────────────────────────────────

function StatutBadgeSelect({ panneId, initialStatut }: { panneId: number; initialStatut: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [statut, setStatut] = useState(initialStatut)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setStatut(next)
    startTransition(async () => {
      await updatePanneStatut(panneId, next)
      router.refresh()
    })
  }

  return (
    <select
      value={statut}
      onChange={handleChange}
      disabled={isPending}
      title="Cliquer pour changer le statut"
      className={`
        rounded-full px-2.5 py-0.5 text-[10px] font-semibold border-0
        cursor-pointer appearance-none text-center
        transition-opacity disabled:opacity-50
        ${STATUT_PANNE_COLORS[statut] ?? 'bg-gray-100 text-gray-700'}
      `}
    >
      {Object.entries(STATUT_PANNE_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  )
}

// ─── Main component ───────────────────────────────────────────

export function PannesTable({
  data,
  canModifier  = true,
  canSupprimer = true,
}: {
  data: PanneRow[]
  canModifier?:  boolean
  canSupprimer?: boolean
}) {
  const [confirmId,  setConfirmId]  = useState<number | null>(null)
  const [errorMsg,   setErrorMsg]   = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()
  const router = useRouter()

  function handleDeleteClick(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setErrorMsg(null)
    setConfirmId(id)
  }

  function handleDeleteConfirm(id: number) {
    startTransition(async () => {
      const result = await deletePanne(id)
      if (result.success) {
        setConfirmId(null)
        router.refresh()
      } else {
        setConfirmId(null)
        setErrorMsg(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Wrench size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucune panne trouvée</p>
        <p className="text-xs">Modifiez vos filtres ou déclarez une panne</p>
        {canModifier && (
          <Link href="/pannes/nouvelle" className="btn-primary mt-2">
            + Déclarer une panne
          </Link>
        )}
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
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Matériel</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Priorité</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {data.map((p) => {
                const isConfirm = confirmId === p.id

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">

                    {/* ID */}
                    <td className="px-3 py-3.5">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{p.id}
                      </span>
                    </td>

                    {/* Matériel */}
                    <td className="px-3 py-3.5">
                      <Link
                        href={`/materiels/${p.materiel.id}`}
                        className="text-sm font-mono font-bold text-gray-900 hover:text-green-700 transition-colors"
                      >
                        {p.materiel.numeroInventaire}
                      </Link>
                      <p className="text-xs text-gray-400 truncate max-w-[10rem]">
                        {p.materiel.article.designation}
                      </p>
                    </td>

                    {/* Description */}
                    <td className="px-3 py-3.5">
                      <p className="text-sm text-gray-700 max-w-[14rem] line-clamp-2" title={p.description}>
                        {p.description}
                      </p>
                      {p.reparationsCount > 0 && (
                        <Link
                          href={`/reparations?panneId=${p.id}`}
                          className="text-[10px] text-blue-600 hover:underline mt-0.5 block"
                        >
                          {p.reparationsCount} réparation(s)
                        </Link>
                      )}
                    </td>

                    {/* Priorité */}
                    <td className="px-3 py-3.5 text-center">
                      <span className={`badge text-[10px] ${PRIORITE_COLORS[p.priorite] ?? 'bg-gray-100 text-gray-700'}`}>
                        {PRIORITE_LABELS[p.priorite] ?? p.priorite}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-3 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(p.date)}
                    </td>

                    {/* Statut (clickable badge-select) */}
                    <td className="px-3 py-3.5 text-center">
                      {canModifier ? (
                        <StatutBadgeSelect panneId={p.id} initialStatut={p.statut} />
                      ) : (
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${STATUT_PANNE_COLORS[p.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                          {STATUT_PANNE_LABELS[p.statut] ?? p.statut}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {isConfirm && canSupprimer ? (
                        <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Supprimer ?</span>
                          <button
                            onClick={() => handleDeleteConfirm(p.id)}
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
                            href={`/pannes/${p.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Voir le détail"
                          >
                            <Eye size={13} />
                            <span className="hidden xl:inline">Voir</span>
                          </Link>
                          {canSupprimer && (
                            <button
                              onClick={(e) => handleDeleteClick(e, p.id)}
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
