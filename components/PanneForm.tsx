'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, Wrench } from 'lucide-react'
import { PRIORITE_LABELS } from '@/lib/utils'
import { createPanne } from '@/app/(dashboard)/pannes/actions'

// ─── Types ────────────────────────────────────────────────────

type MaterielOption = {
  id: number
  numeroInventaire: string
  article: { designation: string; marque: string }
}

type UtilisateurOption = {
  id: number
  nom: string
  prenom: string
}

// ─── Component ────────────────────────────────────────────────

export function PanneForm({
  materiels,
  utilisateurs,
  defaultMaterielId,
}: {
  materiels:          MaterielOption[]
  utilisateurs:       UtilisateurOption[]
  defaultMaterielId?: number
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
      const result = await createPanne(fd)
      if (result.success) {
        router.push('/pannes')
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
          Matériel concerné <span className="text-red-500">*</span>
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
              {m.numeroInventaire} — {m.article.designation} ({m.article.marque})
            </option>
          ))}
        </select>
      </div>

      {/* ── Déclaré par ──────────────────────────────── */}
      <div>
        <label className="label" htmlFor="utilisateurId">
          Déclaré par <span className="text-red-500">*</span>
        </label>
        <select id="utilisateurId" name="utilisateurId" required className="input">
          <option value="">Sélectionner un utilisateur</option>
          {utilisateurs.map((u) => (
            <option key={u.id} value={u.id}>
              {u.prenom} {u.nom}
            </option>
          ))}
        </select>
      </div>

      {/* ── Description ──────────────────────────────── */}
      <div>
        <label className="label" htmlFor="description">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="input resize-none"
          placeholder="Décrivez le problème constaté..."
        />
      </div>

      {/* ── Priorité + Date ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="priorite">
            Priorité <span className="text-red-500">*</span>
          </label>
          <select id="priorite" name="priorite" required defaultValue="MOYENNE" className="input">
            {Object.entries(PRIORITE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            className="input"
            defaultValue={today}
          />
        </div>
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
            <><Wrench size={14} /> Déclarer la panne</>
          )}
        </button>
        <Link href="/pannes" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
