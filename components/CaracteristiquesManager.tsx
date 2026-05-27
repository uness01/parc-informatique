'use client'

import { useState, useTransition } from 'react'
import { Plus, RotateCcw, Pencil, Trash2, Check, X, AlertCircle, Loader2, Settings2 } from 'lucide-react'
import {
  addCaracteristique,
  updateCaracteristique,
  deleteCaracteristique,
} from '@/app/(dashboard)/articles/actions'

// ─── Types ────────────────────────────────────────────────────

type Carac = { id: number; nom: string; valeur: string }

// ─── Sub-component: Nom selector (select or free text) ────────

function NomField({
  value,
  onChange,
  isNew,
  onToggleNew,
  options,
  inputId,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  isNew: boolean
  onToggleNew: () => void
  options: string[]
  inputId?: string
  autoFocus?: boolean
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={inputId} className="label text-[11px] !mb-0">
          Caractéristique <span className="text-red-500">*</span>
        </label>
        {options.length > 0 && (
          <button
            type="button"
            onClick={onToggleNew}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            {isNew
              ? <><RotateCcw size={10} /> Existant</>
              : <><Plus size={10} /> Nouvelle</>}
          </button>
        )}
      </div>
      {isNew || options.length === 0 ? (
        <input
          id={inputId}
          className="input text-sm"
          placeholder="Ex : RAM, Processeur, Stockage..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
        />
      ) : (
        <select
          id={inputId}
          className="input text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Sélectionner...</option>
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────

export function CaracteristiquesManager({
  articleId,
  initialCaracteristiques,
  distinctNoms,
}: {
  articleId: number
  initialCaracteristiques: Carac[]
  distinctNoms: string[]
}) {
  const [caracs, setCaracs]     = useState<Carac[]>(initialCaracteristiques)
  const [nomOptions, setNomOptions] = useState<string[]>(distinctNoms)

  // ── Add form state ─────────────────────────────────────────
  const [addNom,    setAddNom]    = useState('')
  const [addNomNew, setAddNomNew] = useState(distinctNoms.length === 0)
  const [addValeur, setAddValeur] = useState('')
  const [addError,  setAddError]  = useState<string | null>(null)
  const [isAdding, startAddTransition] = useTransition()

  // ── Edit state ─────────────────────────────────────────────
  const [editId,     setEditId]     = useState<number | null>(null)
  const [editNom,    setEditNom]    = useState('')
  const [editNomNew, setEditNomNew] = useState(false)
  const [editValeur, setEditValeur] = useState('')
  const [editError,  setEditError]  = useState<string | null>(null)
  const [isEditing, startEditTransition] = useTransition()

  // ── Delete state ───────────────────────────────────────────
  const [confirmId,    setConfirmId]    = useState<number | null>(null)
  const [deleteError,  setDeleteError]  = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  // ── Helpers ────────────────────────────────────────────────

  function maybeAddNom(nom: string) {
    if (nom && !nomOptions.includes(nom)) {
      setNomOptions((prev) => [...prev, nom].sort())
    }
  }

  function handleAdd() {
    const n = addNom.trim()
    const v = addValeur.trim()
    if (!n) { setAddError('Le nom de la caractéristique est obligatoire.'); return }
    if (!v) { setAddError('La valeur est obligatoire.'); return }
    setAddError(null)

    startAddTransition(async () => {
      const result = await addCaracteristique(articleId, n, v)
      if (result.success && result.data) {
        setCaracs((prev) => [...prev, result.data!])
        maybeAddNom(n)
        setAddNom('')
        setAddValeur('')
        setAddNomNew(false)
      } else {
        setAddError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  function startEdit(c: Carac) {
    setEditId(c.id)
    setEditNom(c.nom)
    setEditNomNew(false)
    setEditValeur(c.valeur)
    setEditError(null)
    setConfirmId(null)
  }

  function cancelEdit() {
    setEditId(null)
    setEditError(null)
  }

  function handleEditSave() {
    const n = editNom.trim()
    const v = editValeur.trim()
    if (!n) { setEditError('Le nom est obligatoire.'); return }
    if (!v) { setEditError('La valeur est obligatoire.'); return }
    setEditError(null)

    startEditTransition(async () => {
      const result = await updateCaracteristique(editId!, n, v)
      if (result.success) {
        setCaracs((prev) =>
          prev.map((c) => (c.id === editId ? { ...c, nom: n, valeur: v } : c))
        )
        maybeAddNom(n)
        setEditId(null)
      } else {
        setEditError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  function handleDeleteConfirm(id: number) {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteCaracteristique(id)
      if (result.success) {
        setCaracs((prev) => prev.filter((c) => c.id !== id))
        setConfirmId(null)
      } else {
        setDeleteError(result.error ?? 'Erreur inconnue.')
        setConfirmId(null)
      }
    })
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Add form ─────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Plus size={15} className="text-purple-700" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">Ajouter une caractéristique</h3>
        </div>

        {addError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
            {addError}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Nom */}
          <NomField
            value={addNom}
            onChange={setAddNom}
            isNew={addNomNew}
            onToggleNew={() => { setAddNomNew((v) => !v); setAddNom('') }}
            options={nomOptions}
            inputId="add-nom"
          />

          {/* Valeur */}
          <div className="flex-1 min-w-0">
            <label htmlFor="add-valeur" className="label text-[11px]">
              Valeur <span className="text-red-500">*</span>
            </label>
            <input
              id="add-valeur"
              className="input text-sm"
              placeholder="Ex : 16 Go, Intel Core i7, 512 Go SSD..."
              value={addValeur}
              onChange={(e) => setAddValeur(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
            />
          </div>

          {/* Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isAdding}
              className="btn-primary px-4 py-2 flex items-center gap-1.5 whitespace-nowrap"
            >
              {isAdding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Ajouter
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────── */}
      {deleteError && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}

      {caracs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center py-12 gap-2 text-gray-400">
          <Settings2 size={36} className="opacity-20" />
          <p className="text-sm font-medium">Aucune caractéristique enregistrée</p>
          <p className="text-xs">Utilisez le formulaire ci-dessus pour en ajouter</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-[40%]">
                  Caractéristique
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-32">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {caracs.map((c) => {
                const isEdit    = editId    === c.id
                const isConfirm = confirmId === c.id

                if (isEdit) {
                  return (
                    <tr key={c.id} className="bg-amber-50/40">
                      {/* Edit nom */}
                      <td className="px-4 py-3">
                        <NomField
                          value={editNom}
                          onChange={setEditNom}
                          isNew={editNomNew}
                          onToggleNew={() => { setEditNomNew((v) => !v); setEditNom('') }}
                          options={nomOptions}
                          inputId={`edit-nom-${c.id}`}
                          autoFocus
                        />
                        {editError && (
                          <p className="text-[11px] text-red-600 mt-1">{editError}</p>
                        )}
                      </td>
                      {/* Edit valeur */}
                      <td className="px-4 py-3">
                        <input
                          className="input text-sm"
                          value={editValeur}
                          onChange={(e) => setEditValeur(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleEditSave() } }}
                          placeholder="Valeur"
                        />
                      </td>
                      {/* Edit actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={handleEditSave}
                            disabled={isEditing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {isEditing
                              ? <Loader2 size={11} className="animate-spin" />
                              : <Check size={11} />}
                            Sauver
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={isEditing}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          >
                            <X size={11} />
                            Annuler
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-800">{c.nom}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.valeur}</td>
                    <td className="px-4 py-3 text-right">
                      {isConfirm ? (
                        <div className="flex items-center justify-end gap-1 bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                          <AlertCircle size={11} className="text-red-500 flex-shrink-0" />
                          <span className="text-[11px] font-semibold text-red-700 whitespace-nowrap">Supprimer ?</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteConfirm(c.id)}
                            disabled={isDeleting}
                            className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600 disabled:opacity-50 transition-colors"
                          >
                            <Check size={9} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={isDeleting}
                            className="w-5 h-5 rounded bg-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-300 transition-colors"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => startEdit(c)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-green-700 hover:bg-green-50 transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={12} />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setConfirmId(c.id); cancelEdit() }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={12} />
                            <span className="hidden sm:inline">Supprimer</span>
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
      )}
    </div>
  )
}
