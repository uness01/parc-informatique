import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  STATUT_MATERIEL_LABELS, STATUT_MATERIEL_COLORS,
  STATUT_PANNE_LABELS, STATUT_PANNE_COLORS,
  PRIORITE_LABELS, PRIORITE_COLORS,
  formatDate, formatCurrency,
} from '@/lib/utils'

export default async function MaterielDetailPage({ params }: { params: { id: string } }) {
  const m = await prisma.materiel.findUnique({
    where: { id: Number(params.id) },
    include: {
      article: {
        include: {
          caracteristiques: true,
          lot: { include: { acquisition: true, societe: true } },
        },
      },
      livraison: true,
      affectations: { include: { utilisateur: true }, orderBy: { dateDebut: 'desc' } },
      pannes: { include: { utilisateur: true, reparations: { include: { societe: true, technicien: true } } }, orderBy: { date: 'desc' } },
      etats: { orderBy: { dateDebut: 'desc' } },
    },
  })

  if (!m) notFound()

  return (
    <>
      <Header title={`Matériel — ${m.numeroInventaire}`} />
      <main className="flex-1 p-6 space-y-6">
        <Link href="/materiels" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={16} />
          Retour à la liste
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{m.article.designation}</h2>
                  <p className="text-sm text-gray-500">{m.article.marque} · {m.article.modele}</p>
                </div>
                <span className={`badge ${STATUT_MATERIEL_COLORS[m.statut]}`}>
                  {STATUT_MATERIEL_LABELS[m.statut]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">N° Inventaire</p>
                  <p className="font-mono font-semibold">{m.numeroInventaire}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">N° Série</p>
                  <p className="font-mono">{m.numeroSerie ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Fin de garantie</p>
                  <p>{formatDate(m.dateFinGarantie)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Prix unitaire</p>
                  <p className="font-semibold">{formatCurrency(m.article.prixUnitaire)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Date de livraison</p>
                  <p>{formatDate(m.livraison.dateLivraison)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">N° BL</p>
                  <p className="font-mono">{m.livraison.numeroBL}</p>
                </div>
              </div>
            </div>

            {/* Caractéristiques */}
            {m.article.caracteristiques.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Caractéristiques techniques</h3>
                <div className="grid grid-cols-2 gap-2">
                  {m.article.caracteristiques.map((c) => (
                    <div key={c.id} className="flex justify-between text-sm py-1 border-b border-gray-50">
                      <span className="text-gray-500">{c.nom}</span>
                      <span className="font-medium text-gray-800">{c.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Affectations */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Historique des affectations</h3>
              {m.affectations.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune affectation.</p>
              ) : (
                <div className="space-y-2">
                  {m.affectations.map((a) => (
                    <div key={a.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{a.direction} — {a.entite}</p>
                        <p className="text-gray-400 text-xs">{a.bureau ? `Bureau ${a.bureau}` : ''} {a.batiment ? `· Bât. ${a.batiment}` : ''}</p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Affecté à : {a.utilisateur.prenom} {a.utilisateur.nom}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDate(a.dateDebut)}</p>
                        <p className="text-xs text-gray-400">{a.dateFin ? `→ ${formatDate(a.dateFin)}` : <span className="text-green-600 font-medium">En cours</span>}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pannes */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Historique des pannes</h3>
              {m.pannes.length === 0 ? (
                <p className="text-sm text-gray-400">Aucune panne enregistrée.</p>
              ) : (
                <div className="space-y-3">
                  {m.pannes.map((p) => (
                    <div key={p.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-medium text-gray-800">{p.description}</p>
                        <div className="flex gap-1.5 ml-2 flex-shrink-0">
                          <span className={`badge ${PRIORITE_COLORS[p.priorite]}`}>{PRIORITE_LABELS[p.priorite]}</span>
                          <span className={`badge ${STATUT_PANNE_COLORS[p.statut]}`}>{STATUT_PANNE_LABELS[p.statut]}</span>
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs">{formatDate(p.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Acquisition</h3>
              <div className="text-sm space-y-2">
                <div>
                  <p className="text-gray-400 text-xs">Code acquisition</p>
                  <p className="font-mono font-semibold">{m.article.lot.acquisition.code}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Lot</p>
                  <p className="font-medium">{m.article.lot.nom}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Fournisseur</p>
                  <p>{m.article.lot.societe.nom}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Date acquisition</p>
                  <p>{formatDate(m.article.lot.acquisition.date)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Actions rapides</h3>
              <div className="space-y-2">
                <Link href={`/affectations/nouvelle?materielId=${m.id}`} className="btn-primary w-full justify-center">
                  Nouvelle affectation
                </Link>
                <Link href={`/pannes/nouvelle?materielId=${m.id}`} className="btn-secondary w-full justify-center">
                  Déclarer une panne
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
