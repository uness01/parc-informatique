import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { LivraisonsTable } from '@/components/LivraisonsTable'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  typeAcq?:      string
  code?:         string
  dateDebut?:    string
  dateFin?:      string
  articleLivre?: string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function LivraisonsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { typeAcq, code, dateDebut, dateFin, articleLivre } = searchParams
  const hasFilters = !!(typeAcq || code || dateDebut || dateFin || articleLivre)

  // Build where clause
  const where: Record<string, any> = {}

  // Filters through lot → acquisition
  const acquisitionWhere: Record<string, any> = {}
  if (typeAcq) acquisitionWhere.type = typeAcq
  if (code)    acquisitionWhere.code = { contains: code, mode: 'insensitive' }
  if (acquisitionWhere.type || acquisitionWhere.code) {
    where.lot = { acquisition: acquisitionWhere }
  }

  // Date range on livraison
  if (dateDebut || dateFin) {
    where.dateLivraison = {
      ...(dateDebut ? { gte: new Date(dateDebut) } : {}),
      ...(dateFin   ? { lte: new Date(dateFin + 'T23:59:59') } : {}),
    }
  }

  // Article livré
  if (articleLivre === 'oui')  where.articleLivre = true
  if (articleLivre === 'non')  where.articleLivre = false

  const livraisons = await prisma.livraison.findMany({
    where,
    include: {
      lot: {
        include: {
          acquisition: { select: { id: true, code: true, type: true, date: true } },
          articles:    { take: 1, select: { designation: true } },
          _count:      { select: { articles: true } },
        },
      },
      _count: { select: { materiels: true } },
    },
    orderBy: { dateLivraison: 'desc' },
  })

  const rows = livraisons.map((l) => ({
    id:             l.id,
    numeroBL:       l.numeroBL,
    dateLivraison:  l.dateLivraison.toISOString(),
    articleLivre:   l.articleLivre,
    materielsCount: l._count.materiels,
    lot: {
      id:            l.lot.id,
      numero:        l.lot.numero,
      nom:           l.lot.nom,
      articlesCount: l.lot._count.articles,
      firstArticle:  l.lot.articles[0]?.designation ?? null,
    },
    acquisition: {
      id:   l.lot.acquisition.id,
      code: l.lot.acquisition.code,
      type: l.lot.acquisition.type,
      date: l.lot.acquisition.date.toISOString(),
    },
  }))

  const livréCount    = livraisons.filter((l) => l.articleLivre).length
  const nonLivréCount = livraisons.length - livréCount

  return (
    <>
      <Header title="Livraisons" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Livraisons</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {livraisons.length} livraison(s)
              {hasFilters && ' trouvée(s) avec les filtres appliqués'}
              {livraisons.length > 0 && (
                <span className="ml-2 font-medium text-gray-700">
                  — <span className="text-green-700">{livréCount} livrée(s)</span>
                  {' · '}
                  <span className="text-gray-500">{nonLivréCount} en attente</span>
                </span>
              )}
            </p>
          </div>
          <Link href="/livraisons/nouveau" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Ajouter une livraison
          </Link>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/livraisons"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Type acquisition */}
            <div>
              <label className="label text-[11px]">Type d&apos;acquisition</label>
              <select name="typeAcq" defaultValue={typeAcq ?? ''} className="input text-sm">
                <option value="">Tous les types</option>
                {Object.entries(TYPE_ACQUISITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Code acquisition */}
            <div>
              <label className="label text-[11px]">Code acquisition</label>
              <input
                name="code"
                defaultValue={code ?? ''}
                placeholder="ACQ-2024-..."
                className="input text-sm"
              />
            </div>

            {/* Date début livraison */}
            <div>
              <label className="label text-[11px]">Date livraison — début</label>
              <input
                name="dateDebut"
                type="date"
                defaultValue={dateDebut ?? ''}
                className="input text-sm"
              />
            </div>

            {/* Date fin livraison */}
            <div>
              <label className="label text-[11px]">Date livraison — fin</label>
              <input
                name="dateFin"
                type="date"
                defaultValue={dateFin ?? ''}
                className="input text-sm"
              />
            </div>

            {/* Article livré */}
            <div>
              <label className="label text-[11px]">Article livré</label>
              <select name="articleLivre" defaultValue={articleLivre ?? ''} className="input text-sm">
                <option value="">Tous</option>
                <option value="oui">Oui — reçu</option>
                <option value="non">Non — en attente</option>
              </select>
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
        <LivraisonsTable data={rows} />

      </main>
    </>
  )
}
