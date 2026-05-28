'use client'

import Link from 'next/link'
import { Eye, UserCheck, Users } from 'lucide-react'
import { formatDate, TYPE_ACQUISITION_LABELS } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────

export type AffectationRow = {
  id: number
  dateDebut: string
  dateFin: string | null
  direction: string
  entite: string
  etatRetour: string | null
  materiel: {
    id: number
    numeroInventaire: string
    numeroSerie: string | null
    statut: string
    article: { designation: string; marque: string; modele: string }
  }
  acquisition: { id: number; code: string; type: string }
  utilisateur: { nom: string; prenom: string }
}

// ─── Helpers ──────────────────────────────────────────────────

const ETAT_RETOUR_LABELS: Record<string, string> = {
  BON:     'Bon état',
  MOYEN:   'État moyen',
  MAUVAIS: 'Mauvais état',
}

// ─── Component ────────────────────────────────────────────────

export function AffectationsTable({
  data,
  canModifier = true,
}: {
  data: AffectationRow[]
  canModifier?: boolean
}) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
        <Users size={44} className="opacity-20" />
        <p className="text-sm font-medium">Aucune affectation trouvée</p>
        <p className="text-xs">Modifiez vos filtres ou créez une affectation</p>
        {canModifier && (
          <Link href="/affectations/nouvelle" className="btn-primary mt-2">
            + Nouvelle affectation
          </Link>
        )}
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
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Matériel</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acquisition</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">N° Inventaire</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">N° Série</th>
              <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-400 uppercase tracking-wider">État</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Entité</th>
              <th className="px-3 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Personne</th>
              <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {data.map((a) => {
              const enCours = !a.dateFin

              return (
                <tr key={a.id} className="hover:bg-gray-50/70 transition-colors">

                  {/* ID */}
                  <td className="px-3 py-3.5">
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      #{a.id}
                    </span>
                  </td>

                  {/* Matériel */}
                  <td className="px-3 py-3.5">
                    <Link
                      href={`/materiels/${a.materiel.id}`}
                      className="text-sm font-semibold text-gray-900 hover:text-green-700 transition-colors"
                    >
                      {a.materiel.article.designation}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {a.materiel.article.marque} · {a.materiel.article.modele}
                    </p>
                  </td>

                  {/* Acquisition */}
                  <td className="px-3 py-3.5">
                    <Link
                      href={`/acquisitions/${a.acquisition.id}`}
                      className="text-sm font-mono font-semibold text-gray-900 hover:text-green-700 transition-colors"
                    >
                      {a.acquisition.code}
                    </Link>
                    <p className="text-xs text-gray-400">
                      {TYPE_ACQUISITION_LABELS[a.acquisition.type] ?? a.acquisition.type}
                    </p>
                  </td>

                  {/* N° Inventaire */}
                  <td className="px-3 py-3.5">
                    <span className="text-sm font-mono font-bold text-gray-900">
                      {a.materiel.numeroInventaire}
                    </span>
                  </td>

                  {/* N° Série */}
                  <td className="px-3 py-3.5">
                    <span className="text-sm font-mono text-gray-500">
                      {a.materiel.numeroSerie ?? '—'}
                    </span>
                  </td>

                  {/* État affectation */}
                  <td className="px-3 py-3.5 text-center">
                    {enCours ? (
                      <div>
                        <span className="badge text-[10px] bg-green-100 text-green-800">En cours</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(a.dateDebut)}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="badge text-[10px] bg-gray-100 text-gray-600">Clôturée</span>
                        {a.etatRetour && (
                          <p className={`text-[10px] mt-0.5 font-medium ${
                            a.etatRetour === 'BON' ? 'text-green-600' :
                            a.etatRetour === 'MOYEN' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {ETAT_RETOUR_LABELS[a.etatRetour]}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-400">
                          {formatDate(a.dateDebut)} → {formatDate(a.dateFin)}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Entité */}
                  <td className="px-3 py-3.5">
                    <p className="text-sm font-medium text-gray-800">{a.entite}</p>
                    <p className="text-xs text-gray-400">{a.direction}</p>
                  </td>

                  {/* Personne */}
                  <td className="px-3 py-3.5">
                    <p className="text-sm text-gray-800">
                      {a.utilisateur.prenom} {a.utilisateur.nom}
                    </p>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-0.5">
                      <Link
                        href={`/affectations/${a.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                        title="Voir le détail"
                      >
                        <Eye size={13} />
                        <span className="hidden xl:inline">Voir</span>
                      </Link>
                      {enCours && canModifier && (
                        <Link
                          href={`/affectations/${a.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Clôturer"
                        >
                          <UserCheck size={13} />
                          <span className="hidden xl:inline">Clôturer</span>
                        </Link>
                      )}
                    </div>
                  </td>

                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
