'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check, AlertCircle, Loader2, LogOut } from 'lucide-react'
import { closeAffectation } from '@/app/(dashboard)/affectations/actions'

const ETAT_RETOUR_LABELS: Record<string, string> = {
  BON:     'Bon état',
  MOYEN:   'État moyen',
  MAUVAIS: 'Mauvais état',
}

export function CloseAffectationForm({ affectationId }: { affectationId: number }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await closeAffectation(affectationId, fd)
      if (result.success) {
        setSuccess(true)
        setIsOpen(false)
        router.refresh()
      } else {
        setError(result.error ?? 'Erreur inconnue.')
      }
    })
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
        <Check size={15} />
        Affectation clôturée avec succès. Le matériel est de nouveau disponible.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-orange-200 overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => { setIsOpen((v) => !v); setError(null) }}
        className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 text-sm font-semibold text-orange-800 hover:bg-orange-100 transition-colors"
      >
        <span className="flex items-center gap-2">
          <LogOut size={14} />
          Clôturer l&apos;affectation
        </span>
        <X
          size={14}
          className={`transition-transform text-orange-400 ${isOpen ? '' : 'rotate-45'}`}
        />
      </button>

      {/* Form */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="px-4 py-4 border-t border-orange-100 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-[11px]">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                name="dateFin"
                type="date"
                required
                className="input text-sm"
                defaultValue={today}
              />
            </div>
            <div>
              <label className="label text-[11px]">
                État de retour <span className="text-red-500">*</span>
              </label>
              <select name="etatRetour" required className="input text-sm">
                <option value="">Sélectionner</option>
                {Object.entries(ETAT_RETOUR_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary text-sm justify-center flex-1"
            >
              {isPending ? (
                <><Loader2 size={13} className="animate-spin" /> Clôture en cours...</>
              ) : (
                <><Check size={13} /> Confirmer la clôture</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="btn-secondary text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
