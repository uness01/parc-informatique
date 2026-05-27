import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createAffectation(formData: FormData) {
  'use server'
  const materielId = Number(formData.get('materielId'))
  const utilisateurId = Number(formData.get('utilisateurId'))

  await prisma.$transaction([
    prisma.affectation.create({
      data: {
        materielId,
        utilisateurId,
        direction: formData.get('direction') as string,
        entite: formData.get('entite') as string,
        batiment: (formData.get('batiment') as string) || null,
        etage: (formData.get('etage') as string) || null,
        bureau: (formData.get('bureau') as string) || null,
        commentaire: (formData.get('commentaire') as string) || null,
        dateDebut: new Date(formData.get('dateDebut') as string),
      },
    }),
    prisma.materiel.update({
      where: { id: materielId },
      data: { statut: 'AFFECTE' },
    }),
  ])
  redirect('/affectations')
}

export default async function NouvelleAffectationPage({
  searchParams,
}: {
  searchParams: { materielId?: string }
}) {
  const [materiels, utilisateurs] = await Promise.all([
    prisma.materiel.findMany({
      where: { statut: 'DISPONIBLE' },
      include: { article: true },
      orderBy: { numeroInventaire: 'asc' },
    }),
    prisma.utilisateur.findMany({
      where: { actif: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    }),
  ])

  return (
    <>
      <Header title="Nouvelle affectation" />
      <main className="flex-1 p-6">
        <Link href="/affectations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Enregistrer une affectation</h2>
            <form action={createAffectation} className="space-y-4">
              <div>
                <label className="label">Matériel disponible *</label>
                <select name="materielId" required defaultValue={searchParams.materielId ?? ''} className="input">
                  <option value="">Sélectionner un matériel</option>
                  {materiels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.numeroInventaire} — {m.article.designation} ({m.article.marque})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Utilisateur bénéficiaire *</label>
                <select name="utilisateurId" required className="input">
                  <option value="">Sélectionner un utilisateur</option>
                  {utilisateurs.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Direction *</label>
                  <input name="direction" required className="input" placeholder="Ex: DSI" />
                </div>
                <div>
                  <label className="label">Entité *</label>
                  <input name="entite" required className="input" placeholder="Ex: Service Informatique" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label">Bâtiment</label>
                  <input name="batiment" className="input" placeholder="A" />
                </div>
                <div>
                  <label className="label">Étage</label>
                  <input name="etage" className="input" placeholder="2" />
                </div>
                <div>
                  <label className="label">Bureau</label>
                  <input name="bureau" className="input" placeholder="205" />
                </div>
              </div>
              <div>
                <label className="label">Date de début *</label>
                <input name="dateDebut" type="date" required className="input"
                  defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="label">Commentaire</label>
                <textarea name="commentaire" rows={3} className="input" placeholder="Observations..."></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/affectations" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
