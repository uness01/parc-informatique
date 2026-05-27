import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createArticle(formData: FormData) {
  'use server'
  const lotId           = Number(formData.get('lotId'))
  const nombreMateriel  = parseInt(formData.get('nombreMateriel') as string)
  const prixUnitaire    = parseFloat(formData.get('prixUnitaire') as string)
  const dateFinGarantie = formData.get('dateFinGarantie') as string | null

  // Parse dynamic caracteristiques rows
  const noms   = formData.getAll('caracNom')   as string[]
  const valeurs = formData.getAll('caracValeur') as string[]
  const caracData = noms
    .map((nom, i) => ({ nom: nom.trim(), valeur: (valeurs[i] ?? '').trim() }))
    .filter((c) => c.nom && c.valeur)

  await prisma.article.create({
    data: {
      numero:           formData.get('numero') as string,
      designation:      formData.get('designation') as string,
      marque:           formData.get('marque') as string,
      modele:           formData.get('modele') as string,
      nombreMateriel,
      prixUnitaire,
      dateFinGarantie:  dateFinGarantie ? new Date(dateFinGarantie) : null,
      lotId,
      caracteristiques: { create: caracData },
    },
  })
  redirect('/articles')
}

export default async function NouvelArticlePage() {
  const lots = await prisma.lot.findMany({
    include: { acquisition: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <>
      <Header title="Ajouter un article" />
      <main className="flex-1 p-6">
        <Link href="/articles" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={15} />
          Retour à la liste
        </Link>

        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Nouvel article</h2>
            <form action={createArticle} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Numéro d&apos;article *</label>
                  <input name="numero" required className="input" placeholder="ART-001" />
                </div>
                <div className="col-span-2">
                  <label className="label">Désignation *</label>
                  <input name="designation" required className="input" placeholder="Ex : Ordinateur portable" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Marque *</label>
                  <input name="marque" required className="input" placeholder="HP, Dell, Lenovo..." />
                </div>
                <div>
                  <label className="label">Modèle *</label>
                  <input name="modele" required className="input" placeholder="ProBook 450 G9..." />
                </div>
              </div>

              <div>
                <label className="label">Lot associé *</label>
                <select name="lotId" required className="input">
                  <option value="">Sélectionner un lot</option>
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nom} — {l.acquisition.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Quantité prévue *</label>
                  <input name="nombreMateriel" type="number" min="1" required className="input" placeholder="10" />
                </div>
                <div>
                  <label className="label">Prix unitaire (MAD) *</label>
                  <input name="prixUnitaire" type="number" step="0.01" required className="input" placeholder="0.00" />
                </div>
              </div>

              <div>
                <label className="label">Date de fin de garantie</label>
                <input name="dateFinGarantie" type="date" className="input" />
              </div>

              {/* Dynamic caracteristiques */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Caractéristiques techniques</label>
                </div>
                <div id="carac-list" className="space-y-2">
                  <div className="flex gap-2">
                    <input name="caracNom"    className="input flex-1" placeholder="Ex : RAM" />
                    <input name="caracValeur" className="input flex-1" placeholder="Ex : 16 Go" />
                  </div>
                  <div className="flex gap-2">
                    <input name="caracNom"    className="input flex-1" placeholder="Ex : Stockage" />
                    <input name="caracValeur" className="input flex-1" placeholder="Ex : 512 Go SSD" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/articles" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
