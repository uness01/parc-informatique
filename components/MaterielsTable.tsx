'use client'

import Link from 'next/link'
import { Eye, UserPlus, Wrench, Monitor } from 'lucide-react'
import { STATUT_MATERIEL_LABELS, STATUT_MATERIEL_COLORS, TYPE_ACQUISITION_LABELS } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────

export type MaterielRow = {
  id: number
  numeroInventaire: string
  numeroSerie: string | null
  statut: string
  article: {
    designation: string
    marque: string
    modele: string
  }
  acquisition: {
    id: number
    code: string
    type: string
  }
}

// ─── Component ────────────────────────────────────────────────

export function MaterielsTable({
  data,
  canAjouterAffectation = true,
  canAjouterPanne       = true,
}: {
  data: MaterielRow[]
  canAjouterAffectation?: boolean
  canAjouterPanne?:       boolean
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Monitor size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucun matériel trouvé</p>
        <p className="text-xs">Modifiez vos filtres ou ajoutez un matériel</p>
        <Link href="/materiels/nouveau" className="btn-primary mt-2">
          + Nouveau matériel
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">ID</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Désignation / Marque / Modèle</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">N° Inventaire</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">N° Série</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acquisition</th>
              <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">État</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {data.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">

                {/* ID */}
                <td className="px-3 py-3.5">
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    #{m.id}
                  </span>
                </td>

                {/* Désignation / Marque / Modèle */}
                <td className="px-3 py-3.5">
                  <p className="text-sm font-semibold text-gray-900">{m.article.designation}</p>
                  <p className="text-xs text-gray-400">{m.article.marque} · {m.article.modele}</p>
                </td>

                {/* N° Inventaire */}
                <td className="px-3 py-3.5">
                  <span className="text-sm font-mono font-bold text-gray-900">{m.numeroInventaire}</span>
                </td>

                {/* N° Série */}
                <td className="px-3 py-3.5">
                  <span className="text-sm font-mono text-gray-500">{m.numeroSerie ?? '—'}</span>
                </td>

                {/* Acquisition */}
                <td className="px-3 py-3.5">
                  <Link
                    href={`/acquisitions/${m.acquisition.id}`}
                    className="text-sm font-mono font-semibold text-gray-900 hover:text-green-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {m.acquisition.code}
                  </Link>
                  <p className="text-xs text-gray-400">
                    {TYPE_ACQUISITION_LABELS[m.acquisition.type] ?? m.acquisition.type}
                  </p>
                </td>

                {/* État */}
                <td className="px-3 py-3.5 text-center">
                  <span className={`badge text-[10px] ${STATUT_MATERIEL_COLORS[m.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                    {STATUT_MATERIEL_LABELS[m.statut] ?? m.statut}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-3.5">
                  <div className="flex items-center justify-end gap-0.5">
                    <Link
                      href={`/materiels/${m.id}`}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      title="Voir la fiche"
                    >
                      <Eye size={13} />
                      <span className="hidden xl:inline">Voir</span>
                    </Link>
                    {canAjouterAffectation && (
                      <Link
                        href={`/affectations/nouvelle?materielId=${m.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Affecter"
                      >
                        <UserPlus size={13} />
                        <span className="hidden xl:inline">Affecter</span>
                      </Link>
                    )}
                    {canAjouterPanne && (
                      <Link
                        href={`/pannes/nouvelle?materielId=${m.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Signaler une panne"
                      >
                        <Wrench size={13} />
                        <span className="hidden xl:inline">Panne</span>
                      </Link>
                    )}
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
