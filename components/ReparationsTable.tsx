'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircle, Check, Trash2, X, Wrench } from 'lucide-react'
import {
  STATUT_REPARATION_LABELS, STATUT_REPARATION_COLORS,
  formatDate, formatCurrency,
} from '@/lib/utils'
import { updateReparationStatut, deleteReparation } from '@/app/(dashboard)/reparations/actions'

// ─── Types ────────────────────────────────────────────────────

export type ReparationRow = {
  id:              number
  codeBon:         string
  typeMaintenance: string
  statut:          string
  dateDebut:       string
  dateFin:         string | null
  cout:            number | null
  panne: {
    id:          number
    description: string
    materiel: {
      id:               number
      numeroInventaire: string
      article: { designation: string; marque: string }
    }
  }
  technicien: { nom: string; prenom: string }
  societe:    { nom: string }
}

// ─── Helpers ──────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  CORRECTIVE: 'Corrective',
  PREVENTIVE: 'Préventive',
}

const TYPE_COLORS: Record<string, string> = {
  CORRECTIVE: 'bg-purple-100 text-purple-800',
  PREVENTIVE: 'bg-teal-100 text-teal-800',
}

// ─── Statut badge-select ──────────────────────────────────────

function StatutBadgeSelect({
  reparationId,
  initialStatut,
}: {
  reparationId:  number
  initialStatut: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [statut, setStatut] = useState(initialStatut)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value
    setStatut(next)
    startTransition(async () => {
      await updateReparationStatut(reparationId, next)
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
        ${STATUT_REPARATION_COLORS[statut] ?? 'bg-gray-100 text-gray-700'}
      `}
    >
      {Object.entries(STATUT_REPARATION_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  )
}

// ─── Main component ───────────────────────────────────────────

export function ReparationsTable({ data }: { data: ReparationRow[] }) {
  const [confirmId,    setConfirmId]    = useState<number | null>(null)
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)
  const [isPending,    startTransition] = useTransition()
  const router = useRouter()

  function handleDeleteClick(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setErrorMsg(null)
    setConfirmId(id)
  }

  function handleDeleteConfirm(id: number) {
    startTransition(async () => {
      const result = await deleteReparation(id)
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
        <p className="text-sm font-medium">Aucune réparation trouvée</p>
        <p className="text-xs">Modifiez vos filtres ou créez une réparation</p>
        <Link href="/reparations/nouvelle" className="btn-primary mt-2">
          + Nouvelle réparation
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
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Code bon</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Panne</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Matériel</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Technicien</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Société</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date début</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Date fin</th>
                <th className="px-3 py-3 text-right  text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Coût (MAD)</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-3 py-3 text-right  text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {data.map((r) => {
                const isConfirm = confirmId === r.id

                return (
                  <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">

                    {/* ID */}
                    <td className="px-3 py-3.5">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{r.id}
                      </span>
                    </td>

                    {/* Code bon */}
                    <td className="px-3 py-3.5">
                      <span className="text-sm font-mono font-semibold text-gray-900">
                        {r.codeBon}
                      </span>
                    </td>

                    {/* Type maintenance */}
                    <td className="px-3 py-3.5 text-center">
                      <span className={`badge text-[10px] ${TYPE_COLORS[r.typeMaintenance] ?? 'bg-gray-100 text-gray-700'}`}>
                        {TYPE_LABELS[r.typeMaintenance] ?? r.typeMaintenance}
                      </span>
                    </td>

                    {/* Panne */}
                    <td className="px-3 py-3.5">
                      <Link
                        href={`/pannes?id=${r.panne.id}`}
                        className="text-xs font-mono font-bold text-orange-600 hover:text-orange-800 transition-colors"
                      >
                        #{r.panne.id}
                      </Link>
                      <p
                        className="text-xs text-gray-400 truncate max-w-[9rem]"
                        title={r.panne.description}
                      >
                        {r.panne.description}
                      </p>
                    </td>

                    {/* Matériel */}
                    <td className="px-3 py-3.5">
                      <Link
                        href={`/materiels/${r.panne.materiel.id}`}
                        className="text-sm font-mono font-bold text-gray-900 hover:text-green-700 transition-colors"
                      >
                        {r.panne.materiel.numeroInventaire}
                      </Link>
                      <p className="text-xs text-gray-400 truncate max-w-[9rem]">
                        {r.panne.materiel.article.designation}
                      </p>
                    </td>

                    {/* Technicien */}
                    <td className="px-3 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                      {r.technicien.prenom} {r.technicien.nom}
                    </td>

                    {/* Société */}
                    <td className="px-3 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {r.societe.nom}
                    </td>

                    {/* Date début */}
                    <td className="px-3 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(r.dateDebut)}
                    </td>

                    {/* Date fin */}
                    <td className="px-3 py-3.5 text-sm whitespace-nowrap">
                      {r.dateFin
                        ? <span className="text-gray-600">{formatDate(r.dateFin)}</span>
                        : <span className="text-gray-300">—</span>
                      }
                    </td>

                    {/* Coût */}
                    <td className="px-3 py-3.5 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                      {r.cout != null
                        ? formatCurrency(r.cout)
                        : <span className="text-gray-300 font-normal">—</span>
                      }
                    </td>

                    {/* Statut */}
                    <td className="px-3 py-3.5 text-center">
                      <StatutBadgeSelect reparationId={r.id} initialStatut={r.statut} />
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {isConfirm ? (
                        <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Supprimer ?</span>
                          <button
                            onClick={() => handleDeleteConfirm(r.id)}
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
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => handleDeleteClick(e, r.id)}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
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
