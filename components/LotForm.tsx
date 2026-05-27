'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Plus, X, Building2, Loader2, CheckCircle2 } from 'lucide-react'
import { createLot, createSociete } from '@/app/(dashboard)/lots/actions'

// ─── Types ────────────────────────────────────────────────────

type Acquisition = { id: number; code: string; date: string }
type Societe = { id: number; nom: string }

// ─── Component ────────────────────────────────────────────────

export function LotForm({
  acquisitions,
  societes: initialSocietes,
  defaultAcquisitionId,
}: {
  acquisitions: Acquisition[]
  societes: Societe[]
  defaultAcquisitionId?: number
}) {
  const [societes, setSocietes] = useState<Societe[]>(initialSocietes)
  const [selectedSocieteId, setSelectedSocieteId] = useState<string>(
    defaultAcquisitionId ? '' : ''
  )
  const [showSocieteForm, setShowSocieteForm]   = useState(false)
  const [societeError, setSocieteError]         = useState<string | null>(null)
  const [societeSuccess, setSocieteSuccess]     = useState<string | null>(null)
  const [isPendingSociete, startSocieteTransition] = useTransition()

  // Inline société field state (no name= attributes, so excluded from main form)
  const [sNom,      setSNom]      = useState('')
  const [sTel,      setSTel]      = useState('')
  const [sFax,      setSFax]      = useState('')
  const [sEmail,    setSEmail]    = useState('')
  const [sAdresse,  setSAdresse]  = useState('')

  function resetSocieteForm() {
    setSNom(''); setSTel(''); setSFax(''); setSEmail(''); setSAdresse('')
    setSocieteError(null)
  }

  function handleCreateSociete() {
    if (!sNom.trim()) {
      setSocieteError('Le nom de la société est obligatoire.')
      return
    }
    startSocieteTransition(async () => {
      const result = await createSociete({
        nom:       sNom.trim(),
        telephone: sTel.trim()     || undefined,
        fax:       sFax.trim()     || undefined,
        email:     sEmail.trim()   || undefined,
        adresse:   sAdresse.trim() || undefined,
      })
      if (result.success && result.id) {
        const newSociete = { id: result.id, nom: result.nom! }
        setSocietes((prev) =>
          [...prev, newSociete].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
        )
        setSelectedSocieteId(String(result.id))
        setSocieteSuccess(`Société « ${result.nom} » créée et sélectionnée.`)
        setShowSocieteForm(false)
        resetSocieteForm()
      } else {
        setSocieteError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  return (
    <form action={createLot} className="space-y-5">

      {/* Acquisition */}
      <div>
        <label className="label" htmlFor="acquisitionId">
          Acquisition associée <span className="text-red-500">*</span>
        </label>
        <select
          id="acquisitionId"
          name="acquisitionId"
          required
          className="input"
          defaultValue={defaultAcquisitionId ?? ''}
        >
          <option value="">Sélectionner une acquisition</option>
          {acquisitions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {new Date(a.date).toLocaleDateString('fr-MA')}
            </option>
          ))}
        </select>
      </div>

      {/* Numéro + Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="numero">
            Numéro du lot <span className="text-red-500">*</span>
          </label>
          <input
            id="numero"
            name="numero"
            required
            className="input font-mono"
            placeholder="LOT-01"
          />
        </div>
        <div>
          <label className="label" htmlFor="nom">
            Nom du lot <span className="text-red-500">*</span>
          </label>
          <input
            id="nom"
            name="nom"
            required
            className="input"
            placeholder="Ex : Lot Informatique 2024"
          />
        </div>
      </div>

      {/* Société */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0" htmlFor="societeId">
            Société / Fournisseur <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setShowSocieteForm((v) => !v)
              setSocieteError(null)
              setSocieteSuccess(null)
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            {showSocieteForm ? <X size={12} /> : <Plus size={12} />}
            {showSocieteForm ? 'Fermer' : 'Nouvelle société'}
          </button>
        </div>

        {/* Success banner */}
        {societeSuccess && !showSocieteForm && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-2">
            <CheckCircle2 size={13} className="flex-shrink-0" />
            {societeSuccess}
          </div>
        )}

        <select
          id="societeId"
          name="societeId"
          required
          className="input"
          value={selectedSocieteId}
          onChange={(e) => {
            setSelectedSocieteId(e.target.value)
            setSocieteSuccess(null)
          }}
        >
          <option value="">Sélectionner une société</option>
          {societes.map((s) => (
            <option key={s.id} value={String(s.id)}>
              {s.nom}
            </option>
          ))}
        </select>

        {/* ── Inline société creation ── */}
        {showSocieteForm && (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Building2 size={14} className="text-green-700" />
              <p className="text-sm font-bold text-green-800">Nouvelle société</p>
            </div>

            {/* Error */}
            {societeError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {societeError}
              </p>
            )}

            {/* Nom */}
            <div>
              <label className="label text-[11px]" htmlFor="s_nom">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                id="s_nom"
                className="input text-sm"
                placeholder="Raison sociale"
                value={sNom}
                onChange={(e) => setSNom(e.target.value)}
              />
            </div>

            {/* Téléphone + Fax */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-[11px]" htmlFor="s_telephone">Téléphone</label>
                <input
                  id="s_telephone"
                  className="input text-sm"
                  placeholder="+212 6 00 00 00 00"
                  value={sTel}
                  onChange={(e) => setSTel(e.target.value)}
                />
              </div>
              <div>
                <label className="label text-[11px]" htmlFor="s_fax">Fax</label>
                <input
                  id="s_fax"
                  className="input text-sm"
                  placeholder="+212 5 00 00 00 00"
                  value={sFax}
                  onChange={(e) => setSFax(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="label text-[11px]" htmlFor="s_email">Email</label>
              <input
                id="s_email"
                type="email"
                className="input text-sm"
                placeholder="contact@societe.ma"
                value={sEmail}
                onChange={(e) => setSEmail(e.target.value)}
              />
            </div>

            {/* Adresse */}
            <div>
              <label className="label text-[11px]" htmlFor="s_adresse">Adresse</label>
              <input
                id="s_adresse"
                className="input text-sm"
                placeholder="Adresse complète"
                value={sAdresse}
                onChange={(e) => setSAdresse(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCreateSociete}
                disabled={isPendingSociete}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {isPendingSociete
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Plus size={12} />}
                Créer la société
              </button>
              <button
                type="button"
                onClick={() => { setShowSocieteForm(false); setSocieteError(null) }}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Montant + Nombre d'articles */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="montant">
            Montant du lot (MAD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="montant"
              name="montant"
              type="number"
              step="0.01"
              min="0"
              required
              className="input pr-14"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
              MAD
            </span>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="nombreArticles">
            Nombre d&apos;articles prévus <span className="text-red-500">*</span>
          </label>
          <input
            id="nombreArticles"
            name="nombreArticles"
            type="number"
            min="1"
            required
            className="input"
            placeholder="1"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" className="btn-primary flex-1 justify-center">
          Valider
        </button>
        <Link href="/lots" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
