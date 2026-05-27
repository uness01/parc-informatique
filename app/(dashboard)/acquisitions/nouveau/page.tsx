import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { TYPE_ACQUISITION_LABELS } from '@/lib/utils'

async function createAcquisition(formData: FormData) {
  'use server'
  await prisma.acquisition.create({
    data: {
      code: formData.get('code') as string,
      type: formData.get('type') as any,
      date: new Date(formData.get('date') as string),
      montant: parseFloat(formData.get('montant') as string),
      nombreLots: parseInt(formData.get('nombreLots') as string),
    },
  })
  redirect('/acquisitions')
}

export default async function NouvelleAcquisitionPage() {
  return (
    <>
      <Header title="Nouvelle acquisition" />
      <main className="flex-1 p-6">
        <Link href="/acquisitions" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Enregistrer une acquisition</h2>
            <form action={createAcquisition} className="space-y-4">
              <div>
                <label className="label">Code *</label>
                <input name="code" required className="input" placeholder="ACQ-2024-001" />
              </div>
              <div>
                <label className="label">Type *</label>
                <select name="type" required className="input">
                  {Object.entries(TYPE_ACQUISITION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date *</label>
                <input name="date" type="date" required className="input" />
              </div>
              <div>
                <label className="label">Montant total (MAD) *</label>
                <input name="montant" type="number" step="0.01" required className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">Nombre de lots *</label>
                <input name="nombreLots" type="number" min="1" required className="input" placeholder="1" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/acquisitions" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
