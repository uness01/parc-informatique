import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { STATUT_PANNE_LABELS, PRIORITE_LABELS } from '@/lib/utils'
import { PannesTable } from '@/components/PannesTable'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  materiel?:  string
  statut?:    string
  priorite?:  string
  dateFrom?:  string
  dateTo?:    string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function PannesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { materiel, statut, priorite, dateFrom, dateTo } = searchParams

  const hasFilters = !!(materiel || statut || priorite || dateFrom || dateTo)

  const where: Record<string, any> = {}
  if (materiel) where.materiel = { numeroInventaire: { contains: materiel, mode: 'insensitive' } }
  if (statut)   where.statut   = statut
  if (priorite) where.priorite = priorite
  if (dateFrom || dateTo) {
    where.date = {}
    if (dateFrom) where.date.gte = new Date(dateFrom)
    if (dateTo)   where.date.lte = new Date(dateTo + 'T23:59:59')
  }

  const pannes = await prisma.panne.findMany({
    where,
    include: {
      materiel:    { include: { article: true } },
      utilisateur: true,
      _count:      { select: { reparations: true } },
    },
    orderBy: { date: 'desc' },
  })

  const rows = pannes.map((p) => ({
    id:               p.id,
    description:      p.description,
    priorite:         p.priorite,
    statut:           p.statut,
    date:             p.date.toISOString(),
    reparationsCount: p._count.reparations,
    materiel: {
      id:               p.materiel.id,
      numeroInventaire: p.materiel.numeroInventaire,
      article: {
        designation: p.materiel.article.designation,
        marque:      p.materiel.article.marque,
      },
    },
    utilisateur: {
      nom:    p.utilisateur.nom,
      prenom: p.utilisateur.prenom,
    },
  }))

  const ouvertesCount = pannes.filter((p) => p.statut === 'OUVERTE').length
  const enCoursCount  = pannes.filter((p) => p.statut === 'EN_COURS').length
  const resoluesCount = pannes.filter((p) => p.statut === 'RESOLUE').length

  return (
    <>
      <Header title="Pannes" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pannes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {pannes.length} panne(s)
              {hasFilters && ' trouvée(s) avec les filtres appliqués'}
              {pannes.length > 0 && (
                <span className="ml-2 font-medium">
                  {ouvertesCount > 0 && <span className="text-red-600"> — {ouvertesCount} ouverte(s)</span>}
                  {enCoursCount  > 0 && <span className="text-orange-600"> · {enCoursCount} en cours</span>}
                  {resoluesCount > 0 && <span className="text-green-700"> · {resoluesCount} résolue(s)</span>}
                </span>
              )}
            </p>
          </div>
          <Link href="/pannes/nouvelle" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Déclarer une panne
          </Link>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/pannes"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* N° inventaire */}
            <div>
              <label className="label text-[11px]">N° inventaire</label>
              <input
                name="materiel"
                defaultValue={materiel ?? ''}
                placeholder="INV-..."
                className="input text-sm"
              />
            </div>

            {/* Statut */}
            <div>
              <label className="label text-[11px]">Statut</label>
              <select name="statut" defaultValue={statut ?? ''} className="input text-sm">
                <option value="">Tous les statuts</option>
                {Object.entries(STATUT_PANNE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Priorité */}
            <div>
              <label className="label text-[11px]">Priorité</label>
              <select name="priorite" defaultValue={priorite ?? ''} className="input text-sm">
                <option value="">Toutes priorités</option>
                {Object.entries(PRIORITE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="label text-[11px]">Date — du</label>
              <input
                name="dateFrom"
                type="date"
                defaultValue={dateFrom ?? ''}
                className="input text-sm"
              />
            </div>

            {/* Date to */}
            <div>
              <label className="label text-[11px]">Date — au</label>
              <input
                name="dateTo"
                type="date"
                defaultValue={dateTo ?? ''}
                className="input text-sm"
              />
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
        <PannesTable data={rows} />

      </main>
    </>
  )
}
