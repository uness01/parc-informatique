import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createReparation(formData: FormData) {
  'use server'
  await prisma.reparation.create({
    data: {
      codeBon: formData.get('codeBon') as string,
      typeMaintenance: formData.get('typeMaintenance') as any,
      dateDebut: new Date(formData.get('dateDebut') as string),
      dateFin: (formData.get('dateFin') as string) ? new Date(formData.get('dateFin') as string) : null,
      cout: formData.get('cout') ? parseFloat(formData.get('cout') as string) : null,
      rapport: (formData.get('rapport') as string) || null,
      statut: 'EN_COURS',
      panneId: Number(formData.get('panneId')),
      technicienId: Number(formData.get('technicienId')),
      societeId: Number(formData.get('societeId')),
    },
  })
  redirect('/reparations')
}

export default async function NouvelleReparationPage({
  searchParams,
}: {
  searchParams: { panneId?: string }
}) {
  const [pannes, techniciens, societes] = await Promise.all([
    prisma.panne.findMany({
      where: { statut: { in: ['OUVERTE', 'EN_COURS'] } },
      include: { materiel: { include: { article: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.utilisateur.findMany({
      where: { role: { in: ['TECHNICIEN', 'ADMIN'] }, actif: true },
      orderBy: [{ nom: 'asc' }],
    }),
    prisma.societe.findMany({ orderBy: { nom: 'asc' } }),
  ])

  return (
    <>
      <Header title="Nouvelle réparation" />
      <main className="flex-1 p-6">
        <Link href="/reparations" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Enregistrer une réparation</h2>
            <form action={createReparation} className="space-y-4">
              <div>
                <label className="label">Code Bon *</label>
                <input name="codeBon" required className="input" placeholder="BON-2024-001" />
              </div>
              <div>
                <label className="label">Panne associée *</label>
                <select name="panneId" required defaultValue={searchParams.panneId ?? ''} className="input">
                  <option value="">Sélectionner une panne</option>
                  {pannes.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} — {p.materiel.article.designation} ({p.materiel.numeroInventaire}): {p.description.slice(0, 50)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Type de maintenance *</label>
                <select name="typeMaintenance" required className="input">
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="PREVENTIVE">Préventive</option>
                </select>
              </div>
              <div>
                <label className="label">Technicien *</label>
                <select name="technicienId" required className="input">
                  <option value="">Sélectionner un technicien</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Société prestataire *</label>
                <select name="societeId" required className="input">
                  <option value="">Sélectionner une société</option>
                  {societes.map((s) => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date de début *</label>
                  <input name="dateDebut" type="date" required className="input"
                    defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label">Date de fin</label>
                  <input name="dateFin" type="date" className="input" />
                </div>
              </div>
              <div>
                <label className="label">Coût (MAD)</label>
                <input name="cout" type="number" step="0.01" className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">Rapport d'intervention</label>
                <textarea name="rapport" rows={4} className="input"
                  placeholder="Détail des travaux effectués..."></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/reparations" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
