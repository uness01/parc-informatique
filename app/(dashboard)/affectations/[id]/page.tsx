import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Monitor, User, MapPin, Calendar, Clock,
  Hash, Building2, Cpu, ShieldCheck, ShieldOff,
  Printer, FileText,
} from 'lucide-react'
import {
  STATUT_MATERIEL_LABELS, STATUT_MATERIEL_COLORS,
  TYPE_ACQUISITION_LABELS, formatDate, formatCurrency,
} from '@/lib/utils'
import { CloseAffectationForm } from '@/components/CloseAffectationForm'

// ─── Helpers ──────────────────────────────────────────────────

const ETAT_RETOUR_LABELS: Record<string, string> = {
  BON:     'Bon état',
  MOYEN:   'État moyen',
  MAUVAIS: 'Mauvais état',
}
const ETAT_RETOUR_COLORS: Record<string, string> = {
  BON:     'bg-green-100 text-green-800',
  MOYEN:   'bg-yellow-100 text-yellow-800',
  MAUVAIS: 'bg-red-100 text-red-800',
}
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

export default async function AffectationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const a = await prisma.affectation.findUnique({
    where: { id: Number(params.id) },
    include: {
      utilisateur: true,
      materiel: {
        include: {
          etats: { orderBy: { dateDebut: 'desc' } },
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
        },
      },
    },
  })

  if (!a) notFound()

  const m           = a.materiel
  const article     = m.article
  const lot         = article.lot
  const acquisition = lot.acquisition
  const societe     = lot.societe
  const enCours     = !a.dateFin

  // Print page base URL (opens in new tab)
  const printBase = `/print/affectations/${a.id}`

  return (
    <>
      <Header title={`Affectation #${a.id}`} />
      <main className="flex-1 p-6 space-y-6">

        {/* ── Breadcrumb ───────────────────────────────── */}
        <Link
          href="/affectations"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux affectations
        </Link>

        {/* ── Header card ──────────────────────────────── */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  #AFF-{a.id}
                </span>
                {enCours ? (
                  <span className="badge bg-green-100 text-green-800 text-[10px]">En cours</span>
                ) : (
                  <span className="badge bg-gray-100 text-gray-600 text-[10px]">Clôturée</span>
                )}
                {a.etatRetour && (
                  <span className={`badge text-[10px] ${ETAT_RETOUR_COLORS[a.etatRetour] ?? ''}`}>
                    {ETAT_RETOUR_LABELS[a.etatRetour]}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {a.direction} — {a.entite}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                <User size={13} />
                {a.utilisateur.prenom} {a.utilisateur.nom}
                {(a.batiment || a.etage || a.bureau) && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <MapPin size={12} />
                    {[a.batiment && `Bât. ${a.batiment}`, a.etage && `Ét. ${a.etage}`, a.bureau && `Bureau ${a.bureau}`]
                      .filter(Boolean).join(' · ')}
                  </span>
                )}
              </p>
            </div>

            {/* Print buttons */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <a
                href={`${printBase}?type=prise-en-charge`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <Printer size={13} />
                Prise en charge
              </a>
              <a
                href={`${printBase}?type=decharge`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <FileText size={13} />
                Décharge
              </a>
              <a
                href={`${printBase}?type=bon-de-sortie`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs"
              >
                <FileText size={13} />
                Bon de sortie
              </a>
            </div>
          </div>

          {/* Dates summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
            <InfoRow label="Date de début">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" />
                {formatDate(a.dateDebut)}
              </span>
            </InfoRow>
            <InfoRow label="Date de fin">
              {a.dateFin ? (
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-gray-400" />
                  {formatDate(a.dateFin)}
                </span>
              ) : (
                <span className="text-green-600 font-medium text-sm">En cours</span>
              )}
            </InfoRow>
            <InfoRow label="Durée">
              {(() => {
                const start = new Date(a.dateDebut)
                const end   = a.dateFin ? new Date(a.dateFin) : new Date()
                const days  = Math.floor((end.getTime() - start.getTime()) / 86400000)
                return <span>{days} jour(s)</span>
              })()}
            </InfoRow>
            <InfoRow label="État de retour">
              {a.etatRetour ? (
                <span className={`badge text-[10px] ${ETAT_RETOUR_COLORS[a.etatRetour] ?? ''}`}>
                  {ETAT_RETOUR_LABELS[a.etatRetour]}
                </span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </InfoRow>
          </div>

          {a.commentaire && (
            <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 italic">
              &ldquo;{a.commentaire}&rdquo;
            </p>
          )}
        </div>

        {/* ── Two-column body ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left (2/3) ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Close affectation (only if en cours) */}
            {enCours && <CloseAffectationForm affectationId={a.id} />}

            {/* Fiche signalétique matériel */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Monitor size={14} />Fiche signalétique du matériel</span>
              </SectionTitle>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Monitor size={18} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{article.designation}</p>
                  <p className="text-sm text-gray-500">{article.marque} · {article.modele}</p>
                  <span className={`badge text-[10px] mt-1 inline-flex ${STATUT_MATERIEL_COLORS[m.statut]}`}>
                    {STATUT_MATERIEL_LABELS[m.statut]}
                  </span>
                </div>
                <Link
                  href={`/materiels/${m.id}`}
                  className="ml-auto text-xs text-green-700 hover:underline"
                >
                  Voir la fiche complète →
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <InfoRow label="N° Inventaire">
                  <span className="font-mono font-bold">{m.numeroInventaire}</span>
                </InfoRow>
                <InfoRow label="N° Série">
                  <span className="font-mono">{m.numeroSerie ?? '—'}</span>
                </InfoRow>
                <InfoRow label="Prix unitaire">
                  <span className="font-semibold">{formatCurrency(article.prixUnitaire)}</span>
                </InfoRow>
                <InfoRow label="Fin de garantie">
                  {m.dateFinGarantie ? (
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={12} className="text-green-600" />
                      {formatDate(m.dateFinGarantie)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <ShieldOff size={12} />Non renseignée
                    </span>
                  )}
                </InfoRow>
                <InfoRow label="N° BL">
                  <span className="font-mono">{m.livraison.numeroBL}</span>
                </InfoRow>
                <InfoRow label="Date livraison">
                  {formatDate(m.livraison.dateLivraison)}
                </InfoRow>
              </div>
            </div>

            {/* Caractéristiques techniques */}
            {article.caracteristiques.length > 0 && (
              <div className="card">
                <SectionTitle>
                  <span className="inline-flex items-center gap-2"><Cpu size={14} />Caractéristiques techniques</span>
                </SectionTitle>
                <div className="divide-y divide-gray-50">
                  {article.caracteristiques.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-gray-500">{c.nom}</span>
                      <span className="font-medium text-gray-800">{c.valeur}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historique des états */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Clock size={14} />Historique des états du matériel</span>
              </SectionTitle>
              {m.etats.length === 0 ? (
                <p className="text-sm text-gray-400">Aucun changement d&apos;état enregistré.</p>
              ) : (
                <div className="relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-100" />
                  <div className="space-y-3">
                    {m.etats.map((e, i) => (
                      <div key={e.id} className="flex items-start gap-3">
                        <div className={`
                          w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 relative z-10
                          ${i === 0 ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-300'}
                        `} />
                        <div className="flex-1 pb-1">
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
          </div>

          {/* ── Right sidebar (1/3) ────────────────────── */}
          <div className="space-y-4">

            {/* Bénéficiaire */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><User size={14} />Bénéficiaire</span>
              </SectionTitle>
              <div className="space-y-2.5 text-sm">
                <p className="font-bold text-gray-900">
                  {a.utilisateur.prenom} {a.utilisateur.nom}
                </p>
                <p className="text-xs text-gray-500">{a.utilisateur.email}</p>
                <div className="pt-2 border-t border-gray-50 space-y-1.5">
                  <InfoRow label="Direction">{a.direction}</InfoRow>
                  <InfoRow label="Entité">{a.entite}</InfoRow>
                  {a.batiment && <InfoRow label="Bâtiment">{a.batiment}</InfoRow>}
                  {a.etage    && <InfoRow label="Étage">{a.etage}</InfoRow>}
                  {a.bureau   && <InfoRow label="Bureau">{a.bureau}</InfoRow>}
                </div>
              </div>
            </div>

            {/* Acquisition */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Hash size={14} />Acquisition</span>
              </SectionTitle>
              <div className="space-y-2.5 text-sm">
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
                <InfoRow label="Lot">
                  <span className="font-mono">{lot.numero}</span> — {lot.nom}
                </InfoRow>
              </div>
            </div>

            {/* Société */}
            <div className="card">
              <SectionTitle>
                <span className="inline-flex items-center gap-2"><Building2 size={14} />Fournisseur</span>
              </SectionTitle>
              <p className="text-sm font-semibold text-gray-900">{societe.nom}</p>
              {societe.telephone && (
                <p className="text-xs text-gray-500 mt-1">{societe.telephone}</p>
              )}
            </div>

          </div>
        </div>
      </main>
    </>
  )
}
