'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, RotateCcw, Info } from 'lucide-react'
import { createArticle } from '@/app/(dashboard)/articles/actions'

// ─── Types ────────────────────────────────────────────────────

type Lot   = { id: number; numero: string; nom: string; acquisitionCode: string }
type Combo = { designation: string; marque: string; modele: string }

// ─── Helpers ──────────────────────────────────────────────────

function ToggleButton({
  isNew,
  onToggle,
  label,
}: {
  isNew: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
    >
      {isNew ? (
        <><RotateCcw size={11} /> Sélectionner existant</>
      ) : (
        <><Plus size={11} /> {label}</>
      )}
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────

export function ArticleForm({
  lots,
  designations,
  marques,
  combinations,
  defaultLotId,
}: {
  lots: Lot[]
  designations: string[]
  marques: string[]
  combinations: Combo[]
  defaultLotId?: number
}) {
  // Designation
  const [designation, setDesignation] = useState('')
  const [desNew, setDesNew]           = useState(designations.length === 0)

  // Marque
  const [marque, setMarque] = useState('')
  const [marqNew, setMarqNew] = useState(marques.length === 0)

  // Modèle — list filtered by current designation + marque
  const [modele, setModele] = useState('')
  const [modNew, setModNew] = useState(false)

  const filteredModeles = useMemo(() => {
    const filtered = combinations.filter(
      (c) =>
        (!designation || c.designation === designation) &&
        (!marque || c.marque === marque)
    )
    return Array.from(new Set(filtered.map((c) => c.modele))).sort()
  }, [combinations, designation, marque])

  // When we switch back from "new" to "select", clear the value
  function toggleDes() {
    setDesNew((v) => !v)
    setDesignation('')
    setMarque('')
    setModele('')
  }
  function toggleMarq() {
    setMarqNew((v) => !v)
    setMarque('')
    setModele('')
  }
  function toggleMod() {
    setModNew((v) => !v)
    setModele('')
  }

  const noModeles = !modNew && filteredModeles.length === 0

  return (
    <form action={createArticle} className="space-y-5">

      {/* Lot */}
      <div>
        <label className="label" htmlFor="lotId">
          Lot associé <span className="text-red-500">*</span>
        </label>
        <select
          id="lotId"
          name="lotId"
          required
          className="input"
          defaultValue={defaultLotId ?? ''}
        >
          <option value="">Sélectionner un lot</option>
          {lots.map((l) => (
            <option key={l.id} value={l.id}>
              {l.numero} — {l.nom} ({l.acquisitionCode})
            </option>
          ))}
        </select>
      </div>

      {/* Numéro */}
      <div>
        <label className="label" htmlFor="numero">
          Numéro d&apos;article <span className="text-red-500">*</span>
        </label>
        <input
          id="numero"
          name="numero"
          required
          className="input font-mono"
          placeholder="ART-001"
        />
      </div>

      {/* ── Désignation ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0">
            Désignation <span className="text-red-500">*</span>
          </label>
          {designations.length > 0 && (
            <ToggleButton isNew={desNew} onToggle={toggleDes} label="Nouvelle désignation" />
          )}
        </div>

        {desNew ? (
          <input
            name="designation"
            required
            autoFocus
            className="input"
            placeholder="Ex : Ordinateur portable"
            value={designation}
            onChange={(e) => { setDesignation(e.target.value); setMarque(''); setModele('') }}
          />
        ) : (
          <select
            name="designation"
            required
            className="input"
            value={designation}
            onChange={(e) => { setDesignation(e.target.value); setMarque(''); setModele('') }}
          >
            <option value="">Sélectionner une désignation</option>
            {designations.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Marque ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0">
            Marque <span className="text-red-500">*</span>
          </label>
          {marques.length > 0 && (
            <ToggleButton isNew={marqNew} onToggle={toggleMarq} label="Nouvelle marque" />
          )}
        </div>

        {marqNew ? (
          <input
            name="marque"
            required
            autoFocus
            className="input"
            placeholder="Ex : Dell, HP, Lenovo..."
            value={marque}
            onChange={(e) => { setMarque(e.target.value); setModele('') }}
          />
        ) : (
          <select
            name="marque"
            required
            className="input"
            value={marque}
            onChange={(e) => { setMarque(e.target.value); setModele('') }}
          >
            <option value="">Sélectionner une marque</option>
            {marques.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>

      {/* ── Modèle ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="label !mb-0">
            Modèle <span className="text-red-500">*</span>
          </label>
          <ToggleButton isNew={modNew} onToggle={toggleMod} label="Nouveau modèle" />
        </div>

        {modNew ? (
          <input
            name="modele"
            required
            autoFocus
            className="input"
            placeholder="Ex : Latitude 5530, EliteBook 840 G9..."
            value={modele}
            onChange={(e) => setModele(e.target.value)}
          />
        ) : (
          <>
            <select
              name="modele"
              required
              className="input"
              value={modele}
              onChange={(e) => setModele(e.target.value)}
              disabled={noModeles}
            >
              <option value="">
                {noModeles ? 'Aucun modèle — cliquez sur « Nouveau modèle »' : 'Sélectionner un modèle'}
              </option>
              {filteredModeles.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {noModeles && (designation || marque) && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-600">
                <Info size={11} />
                Aucun modèle connu pour cette combinaison. Utilisez &quot;Nouveau modèle&quot; pour en saisir un.
              </p>
            )}
          </>
        )}
      </div>

      {/* Nombre de matériel + P.U */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="nombreMateriel">
            Nombre de matériel <span className="text-red-500">*</span>
          </label>
          <input
            id="nombreMateriel"
            name="nombreMateriel"
            type="number"
            min="1"
            required
            className="input"
            placeholder="1"
          />
        </div>
        <div>
          <label className="label" htmlFor="prixUnitaire">
            P.U TTC (MAD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="prixUnitaire"
              name="prixUnitaire"
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
      </div>

      {/* Date fin de garantie */}
      <div>
        <label className="label" htmlFor="dateFinGarantie">
          Date fin de garantie
        </label>
        <input
          id="dateFinGarantie"
          name="dateFinGarantie"
          type="date"
          className="input"
        />
        <p className="mt-1 text-[11px] text-gray-400">
          Optionnel — laisser vide si sans garantie
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2 border-t border-gray-100">
        <button type="submit" className="btn-primary flex-1 justify-center">
          Valider
        </button>
        <Link href="/articles" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
