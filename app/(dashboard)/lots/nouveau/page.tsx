import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createLot(formData: FormData) {
  'use server'
  await prisma.lot.create({
    data: {
      numero:         formData.get('numero') as string,
      nom:            formData.get('nom') as string,
      montant:        parseFloat(formData.get('montant') as string),
      nombreArticles: parseInt(formData.get('nombreArticles') as string),
      acquisitionId:  Number(formData.get('acquisitionId')),
      societeId:      Number(formData.get('societeId')),
    },
  })
  redirect('/lots')
}

export default async function NouveauLotPage() {
  const [acquisitions, societes] = await Promise.all([
    prisma.acquisition.findMany({ orderBy: { date: 'desc' } }),
    prisma.societe.findMany({ orderBy: { nom: 'asc' } }),
  ])

  return (
    <>
      <Header title="Ajouter un lot" />
      <main className="flex-1 p-6">
        <Link href="/lots" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={15} />
          Retour à la liste
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Nouveau lot</h2>
            <form action={createLot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Numéro de lot *</label>
                  <input name="numero" required className="input" placeholder="LOT-01" />
                </div>
                <div>
                  <label className="label">Intitulé du lot *</label>
                  <input name="nom" required className="input" placeholder="Ex : Lot Informatique 2024" />
                </div>
              </div>
              <div>
                <label className="label">Acquisition associée *</label>
                <select name="acquisitionId" required className="input">
                  <option value="">Sélectionner une acquisition</option>
                  {acquisitions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} — {new Date(a.date).toLocaleDateString('fr-MA')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Société / Fournisseur *</label>
                <select name="societeId" required className="input">
                  <option value="">Sélectionner une société</option>
                  {societes.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Montant du lot (MAD) *</label>
                  <input name="montant" type="number" step="0.01" required className="input" placeholder="0.00" />
                </div>
                <div>
                  <label className="label">Nombre d&apos;articles prévus *</label>
                  <input name="nombreArticles" type="number" min="1" required className="input" placeholder="1" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/lots" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
