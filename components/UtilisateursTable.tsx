'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertCircle, Check, CheckCircle2, Edit2,
  Trash2, Users, X, XCircle,
} from 'lucide-react'
import { ROLE_LABELS } from '@/lib/utils'
import { toggleActif, deleteUtilisateur } from '@/app/(dashboard)/utilisateurs/actions'

// ─── Types ────────────────────────────────────────────────────

export type UtilisateurRow = {
  id:     number
  nom:    string
  prenom: string
  email:  string
  login:  string | null
  role:   string
  actif:  boolean
  isSelf: boolean
}

// ─── Helpers ──────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  ADMIN:        'bg-red-100 text-red-800',
  GESTIONNAIRE: 'bg-blue-100 text-blue-800',
  TECHNICIEN:   'bg-orange-100 text-orange-800',
  CONSULTANT:   'bg-gray-100 text-gray-700',
}

// ─── Component ────────────────────────────────────────────────

export function UtilisateursTable({ data }: { data: UtilisateurRow[] }) {
  const [confirmId,    setConfirmId]    = useState<number | null>(null)
  const [errorMsg,     setErrorMsg]     = useState<string | null>(null)
  const [isPending,    startTransition] = useTransition()
  const router = useRouter()

  function handleToggle(u: UtilisateurRow) {
    startTransition(async () => {
      const result = await toggleActif(u.id, !u.actif)
      if (result.success) {
        router.refresh()
      } else {
        setErrorMsg(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  function handleDeleteClick(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    setErrorMsg(null)
    setConfirmId(id)
  }

  function handleDeleteConfirm(id: number) {
    startTransition(async () => {
      const result = await deleteUtilisateur(id)
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
        <Users size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
        <Link href="/utilisateurs/nouveau" className="btn-primary mt-2">
          + Nouvel utilisateur
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
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Nom complet</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-3 py-3 text-left   text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Login</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Rôle</th>
                <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actif</th>
                <th className="px-3 py-3 text-right  text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {data.map((u) => {
                const isConfirm = confirmId === u.id

                return (
                  <tr key={u.id} className={`hover:bg-gray-50/70 transition-colors ${u.isSelf ? 'bg-green-50/30' : ''}`}>

                    {/* ID */}
                    <td className="px-3 py-3.5">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        #{u.id}
                      </span>
                    </td>

                    {/* Nom complet */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.prenom.charAt(0)}{u.nom.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {u.prenom} {u.nom}
                          </p>
                          {u.isSelf && (
                            <p className="text-[10px] text-green-600 font-medium">Vous</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-3 py-3.5 text-sm text-gray-600">
                      {u.email}
                    </td>

                    {/* Login */}
                    <td className="px-3 py-3.5">
                      {u.login ? (
                        <span className="text-sm font-mono text-gray-700">{u.login}</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* Rôle */}
                    <td className="px-3 py-3.5 text-center">
                      <span className={`badge text-[10px] ${ROLE_COLORS[u.role] ?? 'bg-gray-100 text-gray-700'}`}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>

                    {/* Actif */}
                    <td className="px-3 py-3.5 text-center">
                      {u.actif ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <CheckCircle2 size={13} />
                          Oui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                          <XCircle size={13} />
                          Non
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      {isConfirm ? (
                        <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                          <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                          <span className="text-xs font-semibold text-red-700 whitespace-nowrap">Supprimer ?</span>
                          <button
                            onClick={() => handleDeleteConfirm(u.id)}
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
                          {/* Modifier */}
                          <Link
                            href={`/utilisateurs/${u.id}/modifier`}
                            className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 size={13} />
                            <span className="hidden xl:inline">Modifier</span>
                          </Link>

                          {/* Activer / Désactiver */}
                          {!u.isSelf && (
                            <button
                              onClick={() => handleToggle(u)}
                              disabled={isPending}
                              title={u.actif ? 'Désactiver' : 'Activer'}
                              className={`inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                                u.actif
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-green-700 hover:bg-green-50'
                              }`}
                            >
                              {u.actif
                                ? <><XCircle size={13} /><span className="hidden xl:inline">Désactiver</span></>
                                : <><CheckCircle2 size={13} /><span className="hidden xl:inline">Activer</span></>
                              }
                            </button>
                          )}

                          {/* Supprimer */}
                          {!u.isSelf && (
                            <button
                              onClick={(e) => handleDeleteClick(e, u.id)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={13} />
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
