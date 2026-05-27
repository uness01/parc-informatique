import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { LotsTable } from '@/components/LotsTable'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  acquisitionId?: string
  societeId?: string
  numero?: string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function LotsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { acquisitionId, societeId, numero } = searchParams
  const hasFilters = !!(acquisitionId || societeId || numero)

  // Build where clause
  const where: Record<string, any> = {}
  if (acquisitionId) where.acquisitionId = parseInt(acquisitionId)
  if (societeId)     where.societeId     = parseInt(societeId)
  if (numero)        where.numero        = { contains: numero, mode: 'insensitive' }

  const [lots, acquisitions, societes] = await Promise.all([
    prisma.lot.findMany({
      where,
      include: {
        acquisition: { select: { id: true, code: true, type: true } },
        societe:     { select: { nom: true } },
        _count:      { select: { articles: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.acquisition.findMany({ orderBy: { date: 'desc' }, select: { id: true, code: true } }),
    prisma.societe.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true } }),
  ])

  const totalMontant = lots.reduce((s, l) => s + l.montant, 0)

  const rows = lots.map((l) => ({
    id:             l.id,
    numero:         l.numero,
    nom:            l.nom,
    montant:        l.montant,
    nombreArticles: l.nombreArticles,
    articlesCount:  l._count.articles,
    acquisition:    { id: l.acquisition.id, code: l.acquisition.code, type: l.acquisition.type },
    societe:        { nom: l.societe.nom },
  }))

  return (
    <>
      <Header title="Lots" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Lots</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {lots.length} lot(s)
              {hasFilters && ' trouvé(s) avec les filtres appliqués'}
              {lots.length > 0 && (
                <span className="ml-2 font-medium text-gray-700">
                  — Total&nbsp;: {formatCurrency(totalMontant)}
                </span>
              )}
            </p>
          </div>
          <Link href="/lots/nouveau" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Ajouter un lot
          </Link>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/lots"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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

            {/* Société */}
            <div>
              <label className="label text-[11px]">Société</label>
              <select name="societeId" defaultValue={societeId ?? ''} className="input text-sm">
                <option value="">Toutes les sociétés</option>
                {societes.map((s) => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            {/* Numéro */}
            <div>
              <label className="label text-[11px]">Numéro de lot</label>
              <input
                name="numero"
                defaultValue={numero ?? ''}
                placeholder="LOT-..."
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
        <LotsTable data={rows} />

      </main>
    </>
  )
}
