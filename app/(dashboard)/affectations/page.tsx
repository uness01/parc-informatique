import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { AffectationsTable } from '@/components/AffectationsTable'
import { canDo } from '@/lib/permissions'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  numeroInventaire?: string
  numeroSerie?:      string
  acquisitionId?:    string
  lotId?:            string
  articleId?:        string
  designation?:      string
  marque?:           string
  modele?:           string
  statut?:           string
  utilisateurId?:    string
  entite?:           string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function AffectationsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'CONSULTANT'
  const canAjouter  = canDo(role, 'affectations', 'ajouter')
  const canModifier = canDo(role, 'affectations', 'modifier')

  const {
    numeroInventaire, numeroSerie, acquisitionId, lotId,
    articleId, designation, marque, modele,
    statut, utilisateurId, entite,
  } = searchParams

  const hasFilters = !!(
    numeroInventaire || numeroSerie || acquisitionId || lotId ||
    articleId || designation || marque || modele ||
    statut || utilisateurId || entite
  )

  // Build where clause
  const where: Record<string, any> = {}

  // Materiel-level filters
  const materielWhere: Record<string, any> = {}
  if (numeroInventaire) materielWhere.numeroInventaire = { contains: numeroInventaire, mode: 'insensitive' }
  if (numeroSerie)      materielWhere.numeroSerie      = { contains: numeroSerie,      mode: 'insensitive' }

  // Article-level filters (nested under materiel)
  const articleWhere: Record<string, any> = {}
  if (designation) articleWhere.designation = { contains: designation, mode: 'insensitive' }
  if (marque)      articleWhere.marque      = { contains: marque,      mode: 'insensitive' }
  if (modele)      articleWhere.modele      = { contains: modele,      mode: 'insensitive' }
  if (articleId)   articleWhere.id          = Number(articleId)
  if (lotId)       articleWhere.lotId       = Number(lotId)

  // Lot/acquisition nested under article
  if (acquisitionId) articleWhere.lot = { acquisitionId: Number(acquisitionId) }

  if (Object.keys(articleWhere).length > 0) materielWhere.article = articleWhere
  if (Object.keys(materielWhere).length > 0) where.materiel = materielWhere

  // Affectation-direct filters
  if (entite)        where.entite        = { contains: entite, mode: 'insensitive' }
  if (utilisateurId) where.utilisateurId = Number(utilisateurId)
  if (statut === 'en_cours') where.dateFin = null
  if (statut === 'cloturee') where.dateFin = { not: null }

  const [affectations, acquisitions, lots, articles, utilisateurs] = await Promise.all([
    prisma.affectation.findMany({
      where,
      include: {
        utilisateur: { select: { id: true, nom: true, prenom: true } },
        materiel: {
          include: {
            article: {
              include: {
                lot: {
                  include: {
                    acquisition: { select: { id: true, code: true, type: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { dateDebut: 'desc' },
    }),
    prisma.acquisition.findMany({
      orderBy: { date: 'desc' },
      select: { id: true, code: true },
    }),
    prisma.lot.findMany({
      orderBy: { numero: 'asc' },
      select: { id: true, numero: true, nom: true },
    }),
    prisma.article.findMany({
      orderBy: { designation: 'asc' },
      select: { id: true, designation: true, marque: true, modele: true },
    }),
    prisma.utilisateur.findMany({
      where: { actif: true },
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
      select: { id: true, nom: true, prenom: true },
    }),
  ])

  const rows = affectations.map((a) => ({
    id:         a.id,
    dateDebut:  a.dateDebut.toISOString(),
    dateFin:    a.dateFin?.toISOString() ?? null,
    direction:  a.direction,
    entite:     a.entite,
    etatRetour: a.etatRetour,
    materiel: {
      id:              a.materiel.id,
      numeroInventaire: a.materiel.numeroInventaire,
      numeroSerie:     a.materiel.numeroSerie,
      statut:          a.materiel.statut,
      article: {
        designation: a.materiel.article.designation,
        marque:      a.materiel.article.marque,
        modele:      a.materiel.article.modele,
      },
    },
    acquisition: {
      id:   a.materiel.article.lot.acquisition.id,
      code: a.materiel.article.lot.acquisition.code,
      type: a.materiel.article.lot.acquisition.type,
    },
    utilisateur: {
      nom:    a.utilisateur.nom,
      prenom: a.utilisateur.prenom,
    },
  }))

  const enCoursCount  = affectations.filter((a) => !a.dateFin).length
  const clotureCount  = affectations.length - enCoursCount

  return (
    <>
      <Header title="Affectations" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Affectations</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {affectations.length} affectation(s)
              {hasFilters && ' trouvée(s) avec les filtres appliqués'}
              {affectations.length > 0 && (
                <span className="ml-2 font-medium">
                  {enCoursCount > 0 && (
                    <span className="text-green-700"> — {enCoursCount} en cours</span>
                  )}
                  {clotureCount > 0 && (
                    <span className="text-gray-500"> · {clotureCount} clôturée(s)</span>
                  )}
                </span>
              )}
            </p>
          </div>
          {canAjouter && (
            <Link href="/affectations/nouvelle" className="btn-primary flex-shrink-0">
              <Plus size={15} />
              Nouvelle affectation
            </Link>
          )}
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/affectations"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* N° inventaire */}
            <div>
              <label className="label text-[11px]">N° inventaire</label>
              <input name="numeroInventaire" defaultValue={numeroInventaire ?? ''} placeholder="INV-..." className="input text-sm" />
            </div>

            {/* N° série */}
            <div>
              <label className="label text-[11px]">N° série</label>
              <input name="numeroSerie" defaultValue={numeroSerie ?? ''} placeholder="SN-..." className="input text-sm" />
            </div>

            {/* Désignation */}
            <div>
              <label className="label text-[11px]">Désignation</label>
              <input name="designation" defaultValue={designation ?? ''} placeholder="ex. Ordinateur" className="input text-sm" />
            </div>

            {/* Marque */}
            <div>
              <label className="label text-[11px]">Marque</label>
              <input name="marque" defaultValue={marque ?? ''} placeholder="ex. Dell" className="input text-sm" />
            </div>

            {/* Modèle */}
            <div>
              <label className="label text-[11px]">Modèle</label>
              <input name="modele" defaultValue={modele ?? ''} placeholder="ex. Latitude" className="input text-sm" />
            </div>

            {/* Acquisition */}
            <div>
              <label className="label text-[11px]">Acquisition</label>
              <select name="acquisitionId" defaultValue={acquisitionId ?? ''} className="input text-sm">
                <option value="">Toutes les acquisitions</option>
                {acquisitions.map((a) => (
                  <option key={a.id} value={a.id}>{a.code}</option>
                ))}
              </select>
            </div>

            {/* Lot */}
            <div>
              <label className="label text-[11px]">Lot</label>
              <select name="lotId" defaultValue={lotId ?? ''} className="input text-sm">
                <option value="">Tous les lots</option>
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>{l.numero} — {l.nom}</option>
                ))}
              </select>
            </div>

            {/* Article */}
            <div>
              <label className="label text-[11px]">Article</label>
              <select name="articleId" defaultValue={articleId ?? ''} className="input text-sm">
                <option value="">Tous les articles</option>
                {articles.map((a) => (
                  <option key={a.id} value={a.id}>{a.designation} — {a.marque} {a.modele}</option>
                ))}
              </select>
            </div>

            {/* État affectation */}
            <div>
              <label className="label text-[11px]">État</label>
              <select name="statut" defaultValue={statut ?? ''} className="input text-sm">
                <option value="">Tous</option>
                <option value="en_cours">En cours</option>
                <option value="cloturee">Clôturée</option>
              </select>
            </div>

            {/* Personne */}
            <div>
              <label className="label text-[11px]">Personne</label>
              <select name="utilisateurId" defaultValue={utilisateurId ?? ''} className="input text-sm">
                <option value="">Toutes les personnes</option>
                {utilisateurs.map((u) => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom}</option>
                ))}
              </select>
            </div>

            {/* Entité */}
            <div>
              <label className="label text-[11px]">Entité</label>
              <input name="entite" defaultValue={entite ?? ''} placeholder="Service, bureau..." className="input text-sm" />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full justify-center">
                Rechercher
              </button>
            </div>

          </form>
        </div>

        {/* ── Table ────────────────────────────────────── */}
        <AffectationsTable data={rows} canModifier={canModifier} />

      </main>
    </>
  )
}
