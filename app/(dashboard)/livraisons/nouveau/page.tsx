import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createLivraison(formData: FormData) {
  'use server'
  await prisma.livraison.create({
    data: {
      numeroBL:      formData.get('numeroBL') as string,
      dateLivraison: new Date(formData.get('dateLivraison') as string),
      lotId:         Number(formData.get('lotId')),
    },
  })
  redirect('/livraisons')
}

export default async function NouvelleLivraisonPage() {
  const lots = await prisma.lot.findMany({
    include: { acquisition: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Ajouter une livraison" />
      <main className="flex-1 p-6">
        <Link href="/livraisons" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={15} />
          Retour à la liste
        </Link>
        <div className="max-w-xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Nouvelle livraison</h2>
            <form action={createLivraison} className="space-y-4">
              <div>
                <label className="label">Numéro de bon de livraison (BL) *</label>
                <input name="numeroBL" required className="input" placeholder="BL-2024-001" />
              </div>
              <div>
                <label className="label">Date de livraison *</label>
                <input
                  name="dateLivraison"
                  type="date"
                  required
                  className="input"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="label">Lot concerné *</label>
                <select name="lotId" required className="input">
                  <option value="">Sélectionner un lot</option>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nom} — {l.acquisition.code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/livraisons" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
