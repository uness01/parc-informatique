'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, Wrench } from 'lucide-react'
import { STATUT_REPARATION_LABELS } from '@/lib/utils'
import { createReparation } from '@/app/(dashboard)/reparations/actions'

// ─── Types ────────────────────────────────────────────────────

type PanneOption = {
  id:          number
  description: string
  materiel: {
    id:               number
    numeroInventaire: string
    article: { designation: string }
  }
}

type TechnicienOption = {
  id:     number
  nom:    string
  prenom: string
}

type SocieteOption = {
  id:  number
  nom: string
}

// ─── Component ────────────────────────────────────────────────

export function ReparationForm({
  pannes,
  techniciens,
  societes,
  defaultPanneId,
}: {
  pannes:          PanneOption[]
  techniciens:     TechnicienOption[]
  societes:        SocieteOption[]
  defaultPanneId?: number
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createReparation(fd)
      if (result.success) {
        router.push('/reparations')
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

      {/* ── Panne ────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="panneId">
          Panne associée <span className="text-red-500">*</span>
        </label>
        <select
          id="panneId"
          name="panneId"
          required
          className="input"
          defaultValue={defaultPanneId ?? ''}
        >
          <option value="">Sélectionner une panne</option>
          {pannes.map((p) => (
            <option key={p.id} value={p.id}>
              #{p.id} — {p.materiel.numeroInventaire} · {p.materiel.article.designation}
              {' — '}{p.description.slice(0, 55)}{p.description.length > 55 ? '…' : ''}
            </option>
          ))}
        </select>
        {pannes.length === 0 && (
          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={11} />
            Aucune panne ouverte ou en cours.{' '}
            <Link href="/pannes" className="underline">Consulter les pannes</Link>
          </p>
        )}
      </div>

      {/* ── Code bon ─────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="codeBon">
          Code bon de commande <span className="text-red-500">*</span>
        </label>
        <input
          id="codeBon"
          name="codeBon"
          required
          className="input font-mono"
          placeholder="BON-2024-001"
        />
      </div>

      {/* ── Type maintenance + Statut ─────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="typeMaintenance">
            Type de maintenance <span className="text-red-500">*</span>
          </label>
          <select id="typeMaintenance" name="typeMaintenance" required className="input">
            <option value="CORRECTIVE">Corrective</option>
            <option value="PREVENTIVE">Préventive</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="statut">
            Statut <span className="text-red-500">*</span>
          </label>
          <select id="statut" name="statut" required defaultValue="EN_COURS" className="input">
            {Object.entries(STATUT_REPARATION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Technicien ───────────────────────────────── */}
      <div>
        <label className="label" htmlFor="technicienId">
          Technicien <span className="text-red-500">*</span>
        </label>
        <select id="technicienId" name="technicienId" required className="input">
          <option value="">Sélectionner un technicien</option>
          {techniciens.map((t) => (
            <option key={t.id} value={t.id}>
              {t.prenom} {t.nom}
            </option>
          ))}
        </select>
        {techniciens.length === 0 && (
          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={11} />
            Aucun technicien actif.{' '}
            <Link href="/utilisateurs" className="underline">Gérer les utilisateurs</Link>
          </p>
        )}
      </div>

      {/* ── Société ──────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="societeId">
          Société de réparation <span className="text-red-500">*</span>
        </label>
        <select id="societeId" name="societeId" required className="input">
          <option value="">Sélectionner une société</option>
          {societes.map((s) => (
            <option key={s.id} value={s.id}>{s.nom}</option>
          ))}
        </select>
        {societes.length === 0 && (
          <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
            <AlertCircle size={11} />
            Aucune société enregistrée.{' '}
            <Link href="/societes/nouvelle" className="underline">Ajouter une société</Link>
          </p>
        )}
      </div>

      {/* ── Dates ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          <label className="label" htmlFor="dateFin">
            Date de fin
            <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
          </label>
          <input
            id="dateFin"
            name="dateFin"
            type="date"
            className="input"
          />
        </div>
      </div>

      {/* ── Coût ─────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="cout">
          Coût estimé
          <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
        </label>
        <div className="relative">
          <input
            id="cout"
            name="cout"
            type="number"
            step="0.01"
            min="0"
            className="input pr-14"
            placeholder="0.00"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
            MAD
          </span>
        </div>
      </div>

      {/* ── Rapport ──────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="rapport">
          Rapport d'intervention
          <span className="text-gray-400 text-[11px] font-normal ml-1">(optionnel)</span>
        </label>
        <textarea
          id="rapport"
          name="rapport"
          rows={4}
          className="input resize-none"
          placeholder="Détail des travaux effectués, pièces remplacées..."
        />
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
            <><Wrench size={14} /> Enregistrer la réparation</>
          )}
        </button>
        <Link href="/reparations" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
