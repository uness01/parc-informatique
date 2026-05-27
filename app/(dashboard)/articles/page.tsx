import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { ArticlesTable } from '@/components/ArticlesTable'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  lotId?:       string
  designation?: string
  marque?:      string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { lotId, designation, marque } = searchParams
  const hasFilters = !!(lotId || designation || marque)

  const where: Record<string, any> = {}
  if (lotId)       where.lotId       = parseInt(lotId)
  if (designation) where.designation = { contains: designation, mode: 'insensitive' }
  if (marque)      where.marque      = { contains: marque,      mode: 'insensitive' }

  const [articles, lots] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        lot:    { select: { id: true, numero: true, nom: true } },
        _count: { select: { caracteristiques: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.lot.findMany({
      orderBy: { numero: 'asc' },
      select:  { id: true, numero: true, nom: true },
    }),
  ])

  const totalMateriel = articles.reduce((s, a) => s + a.nombreMateriel, 0)

  const rows = articles.map((a) => ({
    id:                    a.id,
    numero:                a.numero,
    designation:           a.designation,
    marque:                a.marque,
    modele:                a.modele,
    nombreMateriel:        a.nombreMateriel,
    prixUnitaire:          a.prixUnitaire,
    dateFinGarantie:       a.dateFinGarantie?.toISOString() ?? null,
    caracteristiquesCount: a._count.caracteristiques,
    lot: { id: a.lot.id, numero: a.lot.numero, nom: a.lot.nom },
  }))

  return (
    <>
      <Header title="Articles" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Articles</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {articles.length} article(s)
              {hasFilters && ' trouvé(s) avec les filtres appliqués'}
              {articles.length > 0 && (
                <span className="ml-2 font-medium text-gray-700">
                  — {totalMateriel} matériel(s) prévu(s)
                </span>
              )}
            </p>
          </div>
          <Link href="/articles/nouveau" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Ajouter un article
          </Link>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/articles"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Désignation */}
            <div>
              <label className="label text-[11px]">Désignation</label>
              <input
                name="designation"
                defaultValue={designation ?? ''}
                placeholder="Ordinateur, imprimante..."
                className="input text-sm"
              />
            </div>

            {/* Marque */}
            <div>
              <label className="label text-[11px]">Marque</label>
              <input
                name="marque"
                defaultValue={marque ?? ''}
                placeholder="HP, Dell, Canon..."
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
        <ArticlesTable data={rows} />

      </main>
    </>
  )
}
