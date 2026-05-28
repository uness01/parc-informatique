'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Loader2, UserCog, Eye, EyeOff } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/utils'
import { createUtilisateur, updateUtilisateur } from '@/app/(dashboard)/utilisateurs/actions'

// ─── Types ────────────────────────────────────────────────────

type DefaultValues = {
  nom:    string
  prenom: string
  email:  string
  login:  string
  role:   string
  actif:  boolean
}

// ─── Helpers ──────────────────────────────────────────────────

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN:        'Accès complet à toutes les fonctionnalités',
  GESTIONNAIRE: 'Gestion du parc, sans accès aux utilisateurs',
  TECHNICIEN:   'Gestion des pannes et réparations',
  CONSULTANT:   'Consultation uniquement (lecture seule)',
}

// ─── Component ────────────────────────────────────────────────

export function UtilisateurForm({
  mode,
  userId,
  defaultValues,
}: {
  mode:           'create' | 'edit'
  userId?:        number
  defaultValues?: DefaultValues
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [actif, setActif] = useState(defaultValues?.actif ?? true)
  const [selectedRole, setSelectedRole] = useState(defaultValues?.role ?? 'CONSULTANT')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    if (actif) fd.set('actif', 'on')

    startTransition(async () => {
      const result = mode === 'create'
        ? await createUtilisateur(fd)
        : await updateUtilisateur(userId!, fd)

      if (result.success) {
        router.push('/utilisateurs')
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

      {/* ── Nom + Prénom ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="prenom">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            id="prenom"
            name="prenom"
            required
            className="input"
            placeholder="Mohamed"
            defaultValue={defaultValues?.prenom}
          />
        </div>
        <div>
          <label className="label" htmlFor="nom">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            id="nom"
            name="nom"
            required
            className="input"
            placeholder="ALAMI"
            defaultValue={defaultValues?.nom}
          />
        </div>
      </div>

      {/* ── Email ────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="email">
          Adresse email <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="m.alami@exemple.ma"
          defaultValue={defaultValues?.email}
        />
      </div>

      {/* ── Login ────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="login">
          Login (identifiant) <span className="text-red-500">*</span>
        </label>
        <input
          id="login"
          name="login"
          required
          className="input font-mono"
          placeholder="m.alami"
          defaultValue={defaultValues?.login}
          autoComplete="username"
        />
        <p className="mt-1 text-[11px] text-gray-400">
          Identifiant unique, sans espaces (ex: m.alami)
        </p>
      </div>

      {/* ── Mot de passe ─────────────────────────────── */}
      <div>
        <label className="label" htmlFor="password">
          Mot de passe
          {mode === 'create' && <span className="text-red-500"> *</span>}
          {mode === 'edit'   && <span className="text-gray-400 text-[11px] font-normal ml-1">(laisser vide pour ne pas modifier)</span>}
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required={mode === 'create'}
            minLength={6}
            className="input pr-10"
            placeholder={mode === 'create' ? 'Minimum 6 caractères' : '••••••••'}
            autoComplete={mode === 'create' ? 'new-password' : 'off'}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      {/* ── Rôle ─────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="role">
          Rôle <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          required
          className="input"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        {selectedRole && (
          <p className="mt-1 text-[11px] text-gray-400">
            {ROLE_DESCRIPTIONS[selectedRole]}
          </p>
        )}
      </div>

      {/* ── Actif toggle ─────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div>
          <p className="text-sm font-medium text-gray-800">Compte actif</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Un compte inactif ne peut pas se connecter
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={actif}
          onClick={() => setActif((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            actif ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              actif ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
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
            <><UserCog size={14} /> {mode === 'create' ? 'Créer l\'utilisateur' : 'Enregistrer les modifications'}</>
          )}
        </button>
        <Link href="/utilisateurs" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
