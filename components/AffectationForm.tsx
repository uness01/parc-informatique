'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertCircle, Loader2, UserCheck, ChevronDown, Calendar,
} from 'lucide-react'
import { createAffectation } from '@/app/(dashboard)/affectations/actions'

// ─── Types ────────────────────────────────────────────────────

type MaterielOption = {
  id: number
  numeroInventaire: string
  numeroSerie: string | null
  statut: string
  article: { designation: string; marque: string; modele: string }
}

type UtilisateurOption = {
  id: number
  nom: string
  prenom: string
  email: string
}

const ETAT_RETOUR_LABELS: Record<string, string> = {
  BON:     'Bon état',
  MOYEN:   'État moyen',
  MAUVAIS: 'Mauvais état',
}

// ─── Component ────────────────────────────────────────────────

export function AffectationForm({
  materiels,
  utilisateurs,
  defaultMaterielId,
}: {
  materiels:        MaterielOption[]
  utilisateurs:     UtilisateurOption[]
  defaultMaterielId?: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [isCloturee, setIsCloturee] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    if (isCloturee) fd.set('cloturee', 'oui')

    startTransition(async () => {
      const result = await createAffectation(fd)
      if (result.success) {
        router.push(result.id ? `/affectations/${result.id}` : '/affectations')
      } else {
        setFormError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error banner */}
      {formError && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          {formError}
        </div>
      )}

      {/* ── Matériel ─────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="materielId">
          Matériel disponible <span className="text-red-500">*</span>
        </label>
        <select
          id="materielId"
          name="materielId"
          required
          className="input"
          defaultValue={defaultMaterielId ?? ''}
        >
          <option value="">Sélectionner un matériel</option>
          {materiels.map((m) => (
            <option key={m.id} value={m.id}>
              {m.numeroInventaire}
              {m.numeroSerie ? ` / ${m.numeroSerie}` : ''}
              {' — '}
              {m.article.designation} ({m.article.marque} {m.article.modele})
            </option>
          ))}
        </select>
        {materiels.length === 0 && (
          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={11} />
            Aucun matériel disponible.{' '}
            <Link href="/materiels" className="underline">Consulter les matériels</Link>
          </p>
        )}
      </div>

      {/* ── Utilisateur ──────────────────────────────── */}
      <div>
        <label className="label" htmlFor="utilisateurId">
          Bénéficiaire <span className="text-red-500">*</span>
        </label>
        <select id="utilisateurId" name="utilisateurId" required className="input">
          <option value="">Sélectionner un utilisateur</option>
          {utilisateurs.map((u) => (
            <option key={u.id} value={u.id}>
              {u.prenom} {u.nom} — {u.email}
            </option>
          ))}
        </select>
      </div>

      {/* ── Direction / Entité ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="direction">
            Direction <span className="text-red-500">*</span>
          </label>
          <input
            id="direction"
            name="direction"
            required
            className="input"
            placeholder="ex. DSI"
          />
        </div>
        <div>
          <label className="label" htmlFor="entite">
            Entité <span className="text-red-500">*</span>
          </label>
          <input
            id="entite"
            name="entite"
            required
            className="input"
            placeholder="ex. Service Informatique"
          />
        </div>
      </div>

      {/* ── Bâtiment / Étage / Bureau ────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label" htmlFor="batiment">Bâtiment</label>
          <input id="batiment" name="batiment" className="input" placeholder="A" />
        </div>
        <div>
          <label className="label" htmlFor="etage">Étage</label>
          <input id="etage" name="etage" className="input" placeholder="2" />
        </div>
        <div>
          <label className="label" htmlFor="bureau">Bureau</label>
          <input id="bureau" name="bureau" className="input" placeholder="205" />
        </div>
      </div>

      {/* ── Date début ───────────────────────────────── */}
      <div>
        <label className="label" htmlFor="dateDebut">
          Date de début <span className="text-red-500">*</span>
        </label>
        <input
          id="dateDebut"
          name="dateDebut"
          type="date"
          required
          className="input"
          defaultValue={today}
        />
      </div>

      {/* ── Commentaire ──────────────────────────────── */}
      <div>
        <label className="label" htmlFor="commentaire">Commentaire</label>
        <textarea
          id="commentaire"
          name="commentaire"
          rows={3}
          className="input resize-none"
          placeholder="Observations, remarques..."
        />
      </div>

      {/* ── Clôturer toggle ──────────────────────────── */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCloturee((v) => !v)}
          className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${
            isCloturee ? 'bg-amber-50 text-amber-800' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            Enregistrer comme affectation déjà clôturée
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${isCloturee ? 'rotate-180' : ''}`}
          />
        </button>

        {isCloturee && (
          <div className="px-4 py-4 border-t border-amber-100 bg-amber-50/30 space-y-4">
            <p className="text-xs text-amber-700">
              Utilisez cette section pour enregistrer une affectation passée dont la restitution a déjà eu lieu.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-[11px]">
                  Date de fin <span className="text-red-500">*</span>
                </label>
                <input
                  name="dateFin"
                  type="date"
                  required={isCloturee}
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="label text-[11px]">
                  État de retour <span className="text-red-500">*</span>
                </label>
                <select name="etatRetour" required={isCloturee} className="input text-sm">
                  <option value="">Sélectionner</option>
                  {Object.entries(ETAT_RETOUR_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Buttons ──────────────────────────────────── */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary flex-1 justify-center"
        >
          {isPending ? (
            <><Loader2 size={14} className="animate-spin" /> Enregistrement...</>
          ) : (
            <><UserCheck size={14} /> Enregistrer l&apos;affectation</>
          )}
        </button>
        <Link href="/affectations" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
