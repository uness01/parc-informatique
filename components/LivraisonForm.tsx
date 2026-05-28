'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronDown, ChevronRight, Check, Loader2,
  CreditCard, Hash, AlertCircle,
} from 'lucide-react'
import { formatCurrency, formatDate, TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { createLivraison } from '@/app/(dashboard)/livraisons/actions'

// ─── Types ────────────────────────────────────────────────────

type LotOption = {
  id: number
  numero: string
  nom: string
  montant: number
  articlesCount: number
}

type AcquisitionOption = {
  id: number
  code: string
  type: string
  date: string
  lots: LotOption[]
}

const ACQ_TYPE_BADGE: Record<string, string> = {
  MARCHE:          'bg-emerald-100 text-emerald-800',
  BON_DE_COMMANDE: 'bg-blue-100 text-blue-800',
  DON:             'bg-purple-100 text-purple-800',
}

// ─── Component ────────────────────────────────────────────────

export function LivraisonForm({
  acquisitions,
}: {
  acquisitions: AcquisitionOption[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [selectedAcqId,  setSelectedAcqId]  = useState<number | ''>('')
  const [selectedLotId,  setSelectedLotId]  = useState<number | null>(null)
  const [formError,      setFormError]      = useState<string | null>(null)

  const selectedAcq = acquisitions.find((a) => a.id === selectedAcqId)

  function handleAcqChange(val: string) {
    setSelectedAcqId(val ? Number(val) : '')
    setSelectedLotId(null)
    setFormError(null)
  }

  function handleLotSelect(lotId: number) {
    setSelectedLotId((prev) => (prev === lotId ? null : lotId))
    setFormError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedLotId) {
      setFormError('Veuillez sélectionner un lot.')
      return
    }
    setFormError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('lotId', String(selectedLotId))

    startTransition(async () => {
      const result = await createLivraison(fd)
      if (result.success) {
        router.push('/livraisons')
      } else {
        setFormError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Error banner */}
      {formError && (
        <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
          {formError}
        </div>
      )}

      {/* ── Acquisition select ────────────────────────── */}
      <div>
        <label className="label" htmlFor="acqSelect">
          Acquisition <span className="text-red-500">*</span>
        </label>
        <select
          id="acqSelect"
          required
          className="input"
          value={selectedAcqId}
          onChange={(e) => handleAcqChange(e.target.value)}
        >
          <option value="">Sélectionner une acquisition</option>
          {acquisitions.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {formatDate(a.date)} — {TYPE_ACQUISITION_LABELS[a.type] ?? a.type}
            </option>
          ))}
        </select>
      </div>

      {/* ── Lots panel (expandable) ───────────────────── */}
      {selectedAcq && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="label !mb-0">
              Lot <span className="text-red-500">*</span>
            </label>
            <span className={`badge text-[10px] ${ACQ_TYPE_BADGE[selectedAcq.type] ?? 'bg-gray-100 text-gray-700'}`}>
              {TYPE_ACQUISITION_LABELS[selectedAcq.type] ?? selectedAcq.type}
            </span>
            <span className="text-xs text-gray-400">
              {selectedAcq.lots.length} lot(s) dans cette acquisition
            </span>
          </div>

          {selectedAcq.lots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
              Aucun lot enregistré pour cette acquisition.
              <Link href="/lots/nouveau" className="block mt-1 text-xs text-green-700 hover:underline">
                + Ajouter un lot
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedAcq.lots.map((lot) => {
                const isSelected = selectedLotId === lot.id
                return (
                  <button
                    key={lot.id}
                    type="button"
                    onClick={() => handleLotSelect(lot.id)}
                    className={`
                      w-full text-left rounded-xl border px-4 py-3 transition-all
                      ${isSelected
                        ? 'border-green-400 bg-green-50 shadow-sm ring-1 ring-green-300'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Toggle icon */}
                      <div className={`
                        w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                        ${isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}
                      `}>
                        {isSelected ? <Check size={11} /> : <ChevronRight size={11} />}
                      </div>

                      {/* Lot info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-mono font-bold text-gray-900">{lot.numero}</span>
                          <span className="text-sm text-gray-700 truncate">{lot.nom}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Hash size={10} />
                            {lot.articlesCount} article(s)
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard size={10} />
                            {formatCurrency(lot.montant)}
                          </span>
                        </div>
                      </div>

                      {/* Selected badge */}
                      {isSelected && (
                        <span className="flex-shrink-0 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Sélectionné
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {selectedLotId === null && (
            <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
              <ChevronDown size={11} />
              Cliquez sur un lot pour le sélectionner
            </p>
          )}
        </div>
      )}

      {/* ── N° BL ────────────────────────────────────── */}
      <div>
        <label className="label" htmlFor="numeroBL">
          Numéro de bon de livraison (BL) <span className="text-red-500">*</span>
        </label>
        <input
          id="numeroBL"
          name="numeroBL"
          required
          className="input font-mono"
          placeholder="BL-2024-001"
        />
      </div>

      {/* ── Date de livraison ─────────────────────────── */}
      <div>
        <label className="label" htmlFor="dateLivraison">
          Date de livraison <span className="text-red-500">*</span>
        </label>
        <input
          id="dateLivraison"
          name="dateLivraison"
          type="date"
          required
          className="input"
          defaultValue={today}
        />
      </div>

      {/* ── Article livré ────────────────────────────── */}
      <div>
        <label className="label" htmlFor="articleLivre">
          Article livré <span className="text-red-500">*</span>
        </label>
        <select
          id="articleLivre"
          name="articleLivre"
          required
          className="input"
          defaultValue="non"
        >
          <option value="non">Non — Bon de livraison enregistré, articles non encore reçus</option>
          <option value="oui">Oui — Articles physiquement reçus et vérifiés</option>
        </select>
        <p className="mt-1 text-[11px] text-gray-400">
          Indique si les articles de ce bon de livraison ont été physiquement reçus.
        </p>
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
            'Valider'
          )}
        </button>
        <Link href="/livraisons" className="btn-secondary flex-1 justify-center">
          Annuler
        </Link>
      </div>

    </form>
  )
}
