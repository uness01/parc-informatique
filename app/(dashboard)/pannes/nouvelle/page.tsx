import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PRIORITE_LABELS } from '@/lib/utils'

async function createPanne(formData: FormData) {
  'use server'
  const materielId = Number(formData.get('materielId'))
  const utilisateurId = Number(formData.get('utilisateurId'))

  await prisma.$transaction([
    prisma.panne.create({
      data: {
        materielId,
        utilisateurId,
        description: formData.get('description') as string,
        priorite: formData.get('priorite') as any,
        statut: 'OUVERTE',
      },
    }),
    prisma.materiel.update({
      where: { id: materielId },
      data: { statut: 'EN_REPARATION' },
    }),
  ])
  redirect('/pannes')
}

export default async function NouvellePannePage({
  searchParams,
}: {
  searchParams: { materielId?: string }
}) {
  const [materiels, utilisateurs] = await Promise.all([
    prisma.materiel.findMany({
      include: { article: true },
      orderBy: { numeroInventaire: 'asc' },
    }),
    prisma.utilisateur.findMany({
      where: { actif: true },
      orderBy: [{ nom: 'asc' }],
    }),
  ])

  return (
    <>
      <Header title="Déclarer une panne" />
      <main className="flex-1 p-6">
        <Link href="/pannes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Déclarer une panne</h2>
            <form action={createPanne} className="space-y-4">
              <div>
                <label className="label">Matériel concerné *</label>
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
                <label className="label">Déclaré par *</label>
                <select name="utilisateurId" required className="input">
                  <option value="">Sélectionner un utilisateur</option>
                  {utilisateurs.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.prenom} {u.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Description *</label>
                <textarea name="description" required rows={4} className="input"
                  placeholder="Décrivez le problème constaté..."></textarea>
              </div>
              <div>
                <label className="label">Priorité *</label>
                <select name="priorite" required defaultValue="MOYENNE" className="input">
                  {Object.entries(PRIORITE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/pannes" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
