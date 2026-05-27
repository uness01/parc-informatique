import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Monitor, Hash, Cpu, Building2, Truck, PackageCheck, PackageX,
  UserPlus, Wrench, MapPin, User, Calendar, Clock, AlertTriangle,
  ShieldCheck, ShieldOff, Phone, Mail, Printer,
} from 'lucide-react'
import {
  STATUT_MATERIEL_LABELS, STATUT_MATERIEL_COLORS,
  STATUT_PANNE_LABELS,    STATUT_PANNE_COLORS,
  PRIORITE_LABELS,         PRIORITE_COLORS,
  TYPE_ACQUISITION_LABELS,
  formatDate, formatCurrency,
} from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────

const ETAT_TYPE_LABELS: Record<string, string> = {
  DISPONIBLE:    'Disponible',
  AFFECTE:       'Affecté',
  EN_REPARATION: 'En réparation',
  REFORME:       'Réformé',
  PERDU:         'Perdu',
}

const ETAT_TYPE_COLORS: Record<string, string> = {
  DISPONIBLE:    'bg-green-100 text-green-800',
  AFFECTE:       'bg-blue-100 text-blue-800',
  EN_REPARATION: 'bg-orange-100 text-orange-800',
  REFORME:       'bg-gray-100 text-gray-800',
  PERDU:         'bg-red-100 text-red-800',
}

// ─── Section header ───────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
      {children}
    </h3>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800">{children}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default async function MaterielDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const m = await prisma.materiel.findUnique({
    where: { id: Number(params.id) },
    include: {
      article: {
        include: {
          caracteristiques: { orderBy: { nom: 'asc' } },
          lot: {
            include: {
              acquisition: true,
              societe:     true,
            },
          },
        },
      },
      livraison: true,
      affectations: {
        include: { utilisateur: true },
        orderBy: { dateDebut: 'desc' },
      },
      etats: { orderBy: { dateDebut: 'desc' } },
      pannes: {
        include: {
          utilisateur: true,
          reparations: {
            include: { societe: true, technicien: true },
            orderBy: { dateDebut: 'desc' },
          },
        },
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!m) notFound()

  const acquisition  = m.article.lot.acquisition
  const societe      = m.article.lot.societe
  const currentAffectation = m.affectations.find((a) => !a.dateFin)

  return (
    <>
      <Header title={`Matériel — ${m.numeroInventaire}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* ── Breadcrumb ───────────────────────────────── */}
        <Link
          href="/materiels"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux matériels
        </Link>

        {/* ── Identity card (full width) ───────────────── */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Monitor size={24} className="text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{m.article.designation}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{m.article.marque} · {m.article.modele}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`badge ${STATUT_MATERIEL_COLORS[m.statut]}`}>
                    {STATUT_MATERIEL_LABELS[m.statut]}
                  </span>
                  {currentAffectation && (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      <MapPin size={10} />
                      {currentAffectation.direction} — {currentAffectation.entite}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <Link
                href={`/affectations/nouvelle?materielId=${m.id}`}
                className="btn-primary text-xs"
              >
                <UserPlus size={13} />
                Affecter
              </Link>
              <Link
                href={`/pannes/nouvelle?materielId=${m.id}`}
                className="btn-secondary text-xs"
              >
                <Wrench size={13} />
                Signaler une panne
              </Link>
            </div>
          </div>

          {/* Identification grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
            <InfoRow label="N° Inventaire">
              <span className="font-mono font-bold text-gray-900">{m.numeroInventaire}</span>
            </InfoRow>
            <InfoRow label="N° Série">
              <span className="font-mono">{m.numeroSerie ?? '—'}</span>
            </InfoRow>
            <InfoRow label="Prix unitaire">
              <span className="font-semibold">{formatCurrency(m.article.prixUnitaire)}</span>
            </InfoRow>
            <InfoRow label="Fin de garantie">
              <span className="inline-flex items-center gap-1">
                {m.dateFinGarantie ? (
                  <>
                    <ShieldCheck size={13} className="text-green-600" />
                    {formatDate(m.dateFinGarantie)}
                  </>
                ) : (
                  <>
                    <ShieldOff size={13} className="text-gray-300" />
                    <span className="text-gray-400">Non renseignée</span>
                  </>
                )}
              </span>
            </InfoRow>
          </div>
        </div>

        {/* ── Two-column body ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left column (2/3) ──────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Caractéristiques techniques */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Cpu size={14} />Caractéristiques techniques</span>
              </SectionTitle>
              {m.article.caracteristiques.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 text-center">
                  Aucune caractéristique enregistrée.
                  <Link
                    href={`/articles/${m.article.id}/caracteristiques`}
                    className="block mt-1 text-xs text-green-700 hover:underline"
                  >
                    + Ajouter des caractéristiques
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x-0">
                  {m.article.caracteristiques.map((c, i) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between py-2 px-1 text-sm ${
                        i < m.article.caracteristiques.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <span className="text-gray-500">{c.nom}</span>
                      <span className="font-medium text-gray-800 ml-2">{c.valeur}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historique des états */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Clock size={14} />Historique des états</span>
              </SectionTitle>
              {m.etats.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">Aucun changement d&apos;état enregistré.</p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />
                  <div className="space-y-3">
                    {m.etats.map((e, i) => (
                      <div key={e.id} className="flex items-start gap-3">
                        <div className={`
                          w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 relative z-10
                          ${i === 0
                            ? 'bg-gray-800 border-gray-800'
                            : 'bg-white border-gray-300'
                          }
                        `} />
                        <div className="flex-1 min-w-0 pb-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`badge text-[10px] ${ETAT_TYPE_COLORS[e.etat] ?? 'bg-gray-100 text-gray-700'}`}>
                              {ETAT_TYPE_LABELS[e.etat] ?? e.etat}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDate(e.dateDebut)}
                              {e.dateFin ? ` → ${formatDate(e.dateFin)}` : (
                                <span className="ml-1 text-green-600 font-medium">· En cours</span>
                              )}
                            </span>
                          </div>
                          {e.commentaire && (
                            <p className="text-xs text-gray-500 mt-0.5">{e.commentaire}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Historique des affectations */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><User size={14} />Historique des affectations</span>
              </SectionTitle>
              {m.affectations.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 text-center">
                  Aucune affectation enregistrée.
                  <Link
                    href={`/affectations/nouvelle?materielId=${m.id}`}
                    className="block mt-1 text-xs text-green-700 hover:underline"
                  >
                    + Créer une affectation
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {m.affectations.map((a) => (
                    <div
                      key={a.id}
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        !a.dateFin
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-100 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900">{a.direction}</p>
                          <p className="text-xs text-gray-500">{a.entite}</p>
                          {(a.batiment || a.etage || a.bureau) && (
                            <p className="text-xs text-gray-400 mt-0.5 inline-flex items-center gap-1">
                              <MapPin size={10} />
                              {[a.batiment && `Bât. ${a.batiment}`, a.etage && `Étage ${a.etage}`, a.bureau && `Bureau ${a.bureau}`]
                                .filter(Boolean).join(' · ')}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1 inline-flex items-center gap-1">
                            <User size={10} />
                            {a.utilisateur.prenom} {a.utilisateur.nom}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {!a.dateFin && (
                            <span className="badge bg-blue-100 text-blue-800 text-[10px] mb-1 block">En cours</span>
                          )}
                          <p className="text-xs text-gray-400">
                            <Calendar size={10} className="inline mr-0.5" />
                            {formatDate(a.dateDebut)}
                          </p>
                          {a.dateFin && (
                            <p className="text-xs text-gray-400">→ {formatDate(a.dateFin)}</p>
                          )}
                        </div>
                      </div>
                      {a.commentaire && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                          {a.commentaire}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historique des pannes */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><AlertTriangle size={14} />Historique des pannes</span>
              </SectionTitle>
              {m.pannes.length === 0 ? (
                <div className="text-sm text-gray-400 py-2 text-center">
                  Aucune panne enregistrée.
                  <Link
                    href={`/pannes/nouvelle?materielId=${m.id}`}
                    className="block mt-1 text-xs text-green-700 hover:underline"
                  >
                    + Déclarer une panne
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {m.pannes.map((p) => (
                    <div key={p.id} className="rounded-xl border border-gray-100 overflow-hidden">
                      {/* Panne header */}
                      <div className="px-4 py-3 bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{p.description}</p>
                            <p className="text-xs text-gray-400 mt-0.5 inline-flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(p.date)}
                              {' · '}
                              <User size={10} />
                              {p.utilisateur.prenom} {p.utilisateur.nom}
                            </p>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <span className={`badge text-[10px] ${PRIORITE_COLORS[p.priorite]}`}>
                              {PRIORITE_LABELS[p.priorite]}
                            </span>
                            <span className={`badge text-[10px] ${STATUT_PANNE_COLORS[p.statut]}`}>
                              {STATUT_PANNE_LABELS[p.statut]}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Réparations */}
                      {p.reparations.length > 0 && (
                        <div className="divide-y divide-gray-50">
                          {p.reparations.map((r) => (
                            <div key={r.id} className="px-4 py-2.5 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-medium text-gray-700">{r.codeBon}</span>
                                <span className="text-gray-400">
                                  {formatDate(r.dateDebut)} {r.dateFin ? `→ ${formatDate(r.dateFin)}` : '· En cours'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-gray-400">
                                <span>{r.societe.nom}</span>
                                {r.cout != null && <span className="font-medium text-gray-600">{formatCurrency(r.cout)}</span>}
                                <span>{r.technicien.prenom} {r.technicien.nom}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Right sidebar (1/3) ────────────────────── */}
          <div className="space-y-4">

            {/* Acquisition */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Hash size={14} />Acquisition</span>
              </SectionTitle>
              <div className="space-y-3 text-sm">
                <InfoRow label="Code">
                  <Link
                    href={`/acquisitions/${acquisition.id}`}
                    className="font-mono font-bold text-green-700 hover:underline"
                  >
                    {acquisition.code}
                  </Link>
                </InfoRow>
                <InfoRow label="Type">
                  <span className={`badge text-[10px] ${
                    acquisition.type === 'MARCHE'          ? 'bg-emerald-100 text-emerald-800' :
                    acquisition.type === 'BON_DE_COMMANDE' ? 'bg-blue-100 text-blue-800'       :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {TYPE_ACQUISITION_LABELS[acquisition.type] ?? acquisition.type}
                  </span>
                </InfoRow>
                <InfoRow label="Date">{formatDate(acquisition.date)}</InfoRow>
                <InfoRow label="Montant">
                  <span className="font-semibold">{formatCurrency(acquisition.montant)}</span>
                </InfoRow>
                <InfoRow label="Lot">
                  <span className="font-mono">{m.article.lot.numero}</span>
                  {' — '}
                  <span className="text-gray-600">{m.article.lot.nom}</span>
                </InfoRow>
              </div>
            </div>

            {/* Livraison */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Truck size={14} />Livraison</span>
              </SectionTitle>
              <div className="space-y-3 text-sm">
                <InfoRow label="N° BL">
                  <span className="font-mono font-bold">{m.livraison.numeroBL}</span>
                </InfoRow>
                <InfoRow label="Date de livraison">
                  {formatDate(m.livraison.dateLivraison)}
                </InfoRow>
                <InfoRow label="Article reçu">
                  {m.livraison.articleLivre ? (
                    <span className="inline-flex items-center gap-1 badge bg-green-100 text-green-800 text-[10px]">
                      <PackageCheck size={9} />Oui — reçu
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 badge bg-gray-100 text-gray-500 text-[10px]">
                      <PackageX size={9} />Non — en attente
                    </span>
                  )}
                </InfoRow>
              </div>
            </div>

            {/* Société fournisseur */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Building2 size={14} />Société fournisseur</span>
              </SectionTitle>
              <div className="space-y-2.5 text-sm">
                <p className="font-semibold text-gray-900">{societe.nom}</p>
                {societe.telephone && (
                  <p className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={11} className="flex-shrink-0" />
                    {societe.telephone}
                  </p>
                )}
                {societe.fax && (
                  <p className="flex items-center gap-2 text-xs text-gray-500">
                    <Printer size={11} className="flex-shrink-0" />
                    {societe.fax}
                  </p>
                )}
                {societe.email && (
                  <p className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={11} className="flex-shrink-0" />
                    {societe.email}
                  </p>
                )}
                {societe.adresse && (
                  <p className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={11} className="flex-shrink-0" />
                    {societe.adresse}
                  </p>
                )}
                {!societe.telephone && !societe.fax && !societe.email && !societe.adresse && (
                  <p className="text-xs text-gray-300">Aucune coordonnée enregistrée.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
