import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { STATUT_MATERIEL_LABELS } from '@/lib/utils'
import { MaterielsTable } from '@/components/MaterielsTable'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  numeroInventaire?: string
  numeroSerie?:      string
  designation?:      string
  marque?:           string
  modele?:           string
  statut?:           string
  acquisitionId?:    string
  lotId?:            string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function MaterielsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const {
    numeroInventaire, numeroSerie, designation,
    marque, modele, statut, acquisitionId, lotId,
  } = searchParams

  const hasFilters = !!(
    numeroInventaire || numeroSerie || designation ||
    marque || modele || statut || acquisitionId || lotId
  )

  // Build where clause
  const conditions: Record<string, any>[] = []

  if (numeroInventaire) conditions.push({ numeroInventaire: { contains: numeroInventaire, mode: 'insensitive' } })
  if (numeroSerie)      conditions.push({ numeroSerie:      { contains: numeroSerie,      mode: 'insensitive' } })
  if (statut)           conditions.push({ statut })

  const articleWhere: Record<string, any> = {}
  if (designation) articleWhere.designation = { contains: designation, mode: 'insensitive' }
  if (marque)      articleWhere.marque      = { contains: marque,      mode: 'insensitive' }
  if (modele)      articleWhere.modele      = { contains: modele,      mode: 'insensitive' }
  if (lotId)       articleWhere.lotId       = Number(lotId)
  if (acquisitionId) articleWhere.lot = { acquisitionId: Number(acquisitionId) }
  if (Object.keys(articleWhere).length > 0) conditions.push({ article: articleWhere })

  const where: Record<string, any> = conditions.length > 0 ? { AND: conditions } : {}

  const [materiels, acquisitions, lots] = await Promise.all([
    prisma.materiel.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.acquisition.findMany({
      orderBy: { date: 'desc' },
      select: { id: true, code: true },
    }),
    prisma.lot.findMany({
      orderBy: { numero: 'asc' },
      select: { id: true, numero: true, nom: true },
    }),
  ])

  const rows = materiels.map((m) => ({
    id:              m.id,
    numeroInventaire: m.numeroInventaire,
    numeroSerie:     m.numeroSerie,
    statut:          m.statut,
    article: {
      designation: m.article.designation,
      marque:      m.article.marque,
      modele:      m.article.modele,
    },
    acquisition: {
      id:   m.article.lot.acquisition.id,
      code: m.article.lot.acquisition.code,
      type: m.article.lot.acquisition.type,
    },
  }))

  // Count by status
  const byStatus: Record<string, number> = {}
  for (const m of materiels) {
    byStatus[m.statut] = (byStatus[m.statut] ?? 0) + 1
  }

  return (
    <>
      <Header title="Matériels" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Matériels</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {materiels.length} matériel(s)
              {hasFilters && ' trouvé(s) avec les filtres appliqués'}
              {materiels.length > 0 && (
                <span className="ml-2 font-medium">
                  {byStatus.DISPONIBLE    ? <span className="text-green-700"> — {byStatus.DISPONIBLE} disponible(s)</span>      : null}
                  {byStatus.AFFECTE       ? <span className="text-blue-700"> · {byStatus.AFFECTE} affecté(s)</span>             : null}
                  {byStatus.EN_REPARATION ? <span className="text-orange-600"> · {byStatus.EN_REPARATION} en réparation</span>  : null}
                  {byStatus.REFORME       ? <span className="text-gray-500"> · {byStatus.REFORME} réformé(s)</span>             : null}
                  {byStatus.PERDU         ? <span className="text-red-600"> · {byStatus.PERDU} perdu(s)</span>                  : null}
                </span>
              )}
            </p>
          </div>
          <Link href="/materiels/nouveau" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Nouveau matériel
          </Link>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/materiels"
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
              <input
                name="numeroInventaire"
                defaultValue={numeroInventaire ?? ''}
                placeholder="INV-..."
                className="input text-sm"
              />
            </div>

            {/* N° série */}
            <div>
              <label className="label text-[11px]">N° série</label>
              <input
                name="numeroSerie"
                defaultValue={numeroSerie ?? ''}
                placeholder="SN-..."
                className="input text-sm"
              />
            </div>

            {/* Désignation */}
            <div>
              <label className="label text-[11px]">Désignation</label>
              <input
                name="designation"
                defaultValue={designation ?? ''}
                placeholder="ex. Ordinateur portable"
                className="input text-sm"
              />
            </div>

            {/* Marque */}
            <div>
              <label className="label text-[11px]">Marque</label>
              <input
                name="marque"
                defaultValue={marque ?? ''}
                placeholder="ex. Dell"
                className="input text-sm"
              />
            </div>

            {/* Modèle */}
            <div>
              <label className="label text-[11px]">Modèle</label>
              <input
                name="modele"
                defaultValue={modele ?? ''}
                placeholder="ex. Latitude 5520"
                className="input text-sm"
              />
            </div>

            {/* État */}
            <div>
              <label className="label text-[11px]">État</label>
              <select name="statut" defaultValue={statut ?? ''} className="input text-sm">
                <option value="">Tous les états</option>
                {Object.entries(STATUT_MATERIEL_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
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

            {/* Submit */}
            <div className="flex items-end lg:col-start-4 lg:justify-end">
              <button type="submit" className="btn-primary justify-center px-8">
                Rechercher
              </button>
            </div>

          </form>
        </div>

        {/* ── Table ────────────────────────────────────── */}
        <MaterielsTable data={rows} />

      </main>
    </>
  )
}
