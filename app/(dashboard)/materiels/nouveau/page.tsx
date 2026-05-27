'use server'

import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createMateriel(formData: FormData) {
  'use server'
  const numeroInventaire = formData.get('numeroInventaire') as string
  const numeroSerie = formData.get('numeroSerie') as string | null
  const articleId = Number(formData.get('articleId'))
  const livraisonId = Number(formData.get('livraisonId'))
  const dateFinGarantie = formData.get('dateFinGarantie') as string | null

  await prisma.materiel.create({
    data: {
      numeroInventaire,
      numeroSerie: numeroSerie || null,
      articleId,
      livraisonId,
      dateFinGarantie: dateFinGarantie ? new Date(dateFinGarantie) : null,
      statut: 'DISPONIBLE',
    },
  })
  redirect('/materiels')
}

export default async function NouveauMaterielPage() {
  const [articles, livraisons] = await Promise.all([
    prisma.article.findMany({ include: { lot: true }, orderBy: { designation: 'asc' } }),
    prisma.livraison.findMany({ include: { lot: true }, orderBy: { dateLivraison: 'desc' } }),
  ])

  return (
    <>
      <Header title="Nouveau matériel" />
      <main className="flex-1 p-6">
        <Link href="/materiels" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour à la liste
        </Link>

        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Enregistrer un nouveau matériel</h2>
            <form action={createMateriel} className="space-y-4">
              <div>
                <label className="label">N° Inventaire *</label>
                <input name="numeroInventaire" required className="input" placeholder="INV-2024-001" />
              </div>
              <div>
                <label className="label">N° Série</label>
                <input name="numeroSerie" className="input" placeholder="SN-XXXXXXXX" />
              </div>
              <div>
                <label className="label">Article *</label>
                <select name="articleId" required className="input">
                  <option value="">Sélectionner un article</option>
                  {articles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.designation} — {a.marque} {a.modele} (Lot: {a.lot.nom})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Livraison *</label>
                <select name="livraisonId" required className="input">
                  <option value="">Sélectionner une livraison</option>
                  {livraisons.map((l) => (
                    <option key={l.id} value={l.id}>
                      BL {l.numeroBL} — {l.lot.nom} ({new Date(l.dateLivraison).toLocaleDateString('fr-MA')})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Date de fin de garantie</label>
                <input name="dateFinGarantie" type="date" className="input" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/materiels" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
