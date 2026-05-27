import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatDate, formatCurrency, TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { PrintTrigger } from '@/components/PrintTrigger'

// ─── Helpers ──────────────────────────────────────────────────

const ETAT_RETOUR_LABELS: Record<string, string> = {
  BON:     'Bon état',
  MOYEN:   'État moyen',
  MAUVAIS: 'Mauvais état',
}

type PrintType = 'prise-en-charge' | 'decharge' | 'bon-de-sortie'

const DOCUMENT_TITLES: Record<PrintType, string> = {
  'prise-en-charge': 'BON DE PRISE EN CHARGE',
  'decharge':        'BON DE DÉCHARGE / RESTITUTION',
  'bon-de-sortie':   'BON DE SORTIE MATÉRIEL',
}

// ─── Page ─────────────────────────────────────────────────────

export default async function PrintAffectationPage({
  params,
  searchParams,
}: {
  params:       { id: string }
  searchParams: { type?: string }
}) {
  const docType = (searchParams.type ?? 'prise-en-charge') as PrintType
  const title   = DOCUMENT_TITLES[docType] ?? DOCUMENT_TITLES['prise-en-charge']

  const a = await prisma.affectation.findUnique({
    where: { id: Number(params.id) },
    include: {
      utilisateur: true,
      materiel: {
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

  const today = new Date()

  return (
    <div className="max-w-[210mm] mx-auto p-8 text-sm font-sans text-gray-900">

      <PrintTrigger />

      {/* ── Document header ────────────────────────────── */}
      <div className="text-center mb-8">
        <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">
          Royaume du Maroc
        </div>
        <div className="font-bold text-base leading-tight">
          Ministère de l&apos;Énergie, des Mines, de l&apos;Eau et de l&apos;Environnement
        </div>
        <div className="text-xs text-gray-500 mt-0.5">
          Direction du Système d&apos;Information
        </div>
        <div className="mt-6 border-t-2 border-b-2 border-gray-800 py-3">
          <h1 className="text-lg font-black uppercase tracking-wide">{title}</h1>
          <p className="text-xs text-gray-500 mt-1">
            N° {String(a.id).padStart(5, '0')} &nbsp;·&nbsp; Date : {formatDate(today)}
          </p>
        </div>
      </div>

      {/* ── Bénéficiaire ─────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="font-bold uppercase text-xs tracking-wide bg-gray-100 px-3 py-1.5 mb-3">
          Bénéficiaire
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-3">
          <DocField label="Nom et prénom" value={`${a.utilisateur.prenom} ${a.utilisateur.nom}`} />
          <DocField label="E-mail" value={a.utilisateur.email} />
          <DocField label="Direction" value={a.direction} />
          <DocField label="Entité" value={a.entite} />
          {a.batiment && <DocField label="Bâtiment" value={a.batiment} />}
          {a.etage    && <DocField label="Étage"    value={a.etage} />}
          {a.bureau   && <DocField label="Bureau"   value={a.bureau} />}
        </div>
      </section>

      {/* ── Matériel ─────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="font-bold uppercase text-xs tracking-wide bg-gray-100 px-3 py-1.5 mb-3">
          Matériel affecté
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-3">
          <DocField label="Désignation" value={article.designation} />
          <DocField label="Marque" value={article.marque} />
          <DocField label="Modèle" value={article.modele} />
          <DocField label="N° Inventaire" value={m.numeroInventaire} mono />
          <DocField label="N° Série" value={m.numeroSerie ?? '—'} mono />
          <DocField label="Prix unitaire" value={formatCurrency(article.prixUnitaire)} />
          {m.dateFinGarantie && (
            <DocField label="Fin de garantie" value={formatDate(m.dateFinGarantie)} />
          )}
        </div>

        {article.caracteristiques.length > 0 && (
          <div className="mt-3 px-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Caractéristiques techniques
            </p>
            <div className="grid grid-cols-3 gap-2">
              {article.caracteristiques.map((c) => (
                <div key={c.id} className="text-xs">
                  <span className="text-gray-500">{c.nom} : </span>
                  <span className="font-medium">{c.valeur}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Acquisition & Livraison ──────────────────────── */}
      <section className="mb-6">
        <h2 className="font-bold uppercase text-xs tracking-wide bg-gray-100 px-3 py-1.5 mb-3">
          Acquisition et livraison
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-3">
          <DocField label="Code acquisition"         value={acquisition.code} mono />
          <DocField label="Type"                     value={TYPE_ACQUISITION_LABELS[acquisition.type] ?? acquisition.type} />
          <DocField label="Date acquisition"         value={formatDate(acquisition.date)} />
          <DocField label="Fournisseur"              value={societe.nom} />
          <DocField label="Lot"                      value={`${lot.numero} — ${lot.nom}`} />
          <DocField label="N° BL"                    value={m.livraison.numeroBL} mono />
          <DocField label="Date de livraison"        value={formatDate(m.livraison.dateLivraison)} />
        </div>
      </section>

      {/* ── Dates affectation ─────────────────────────────── */}
      <section className="mb-6">
        <h2 className="font-bold uppercase text-xs tracking-wide bg-gray-100 px-3 py-1.5 mb-3">
          Période d&apos;affectation
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-3">
          <DocField label="Date de début" value={formatDate(a.dateDebut)} />
          {docType === 'decharge' ? (
            <>
              <DocField label="Date de retour" value={a.dateFin ? formatDate(a.dateFin) : '____/____/________'} />
              <DocField
                label="État de retour"
                value={a.etatRetour ? ETAT_RETOUR_LABELS[a.etatRetour] : '_______________________'}
              />
            </>
          ) : (
            <DocField label="Date de fin prévue" value="____/____/________" />
          )}
        </div>
        {a.commentaire && (
          <div className="mt-2 px-3">
            <DocField label="Observations" value={a.commentaire} />
          </div>
        )}
      </section>

      {/* ── Signatures ───────────────────────────────────── */}
      <section className="mt-10">
        <div className="grid grid-cols-2 gap-8 text-center">
          <div className="border border-gray-300 rounded p-4 min-h-[100px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Signature du bénéficiaire
            </p>
            <p className="text-xs text-gray-400 mt-6">{a.utilisateur.prenom} {a.utilisateur.nom}</p>
          </div>
          <div className="border border-gray-300 rounded p-4 min-h-[100px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1">
              Cachet et signature du responsable
            </p>
            <p className="text-xs text-gray-400 mt-6">Direction du Système d&apos;Information</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Fait à Rabat, le {formatDate(today)}
        </p>
      </section>

      {/* ── Back button (hidden when printing) ───────────── */}
      <div className="mt-8 text-center print:hidden">
        <button
          onClick={() => window.close()}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Fermer cette fenêtre
        </button>
      </div>
    </div>
  )
}

// ─── Sub-component ────────────────────────────────────────────

function DocField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono font-semibold' : 'font-medium'} border-b border-dotted border-gray-300 pb-0.5`}>
        {value}
      </span>
    </div>
  )
}
