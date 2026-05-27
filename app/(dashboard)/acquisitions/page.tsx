import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { formatCurrency, TYPE_ACQUISITION_LABELS } from '@/lib/utils'
import { AcquisitionsTable } from '@/components/AcquisitionsTable'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  type?: string
  code?: string
  dateDebut?: string
  dateFin?: string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function AcquisitionsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { type, code, dateDebut, dateFin } = searchParams
  const hasFilters = !!(type || code || dateDebut || dateFin)

  // Build Prisma where clause
  const where: Record<string, any> = {}
  if (type)      where.type = type as any
  if (code)      where.code = { contains: code, mode: 'insensitive' }
  if (dateDebut || dateFin) {
    where.date = {
      ...(dateDebut ? { gte: new Date(dateDebut) } : {}),
      ...(dateFin   ? { lte: new Date(dateFin + 'T23:59:59') } : {}),
    }
  }

  const acquisitions = await prisma.acquisition.findMany({
    where,
    include: {
      lots: {
        include: { societe: true },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Summary stats
  const totalMontant = acquisitions.reduce((s, a) => s + a.montant, 0)

  // Serialise dates for client component
  const rows = acquisitions.map((a) => ({
    ...a,
    date:      a.date.toISOString(),
    createdAt: a.createdAt.toISOString(),
    lots: a.lots.map((l) => ({
      id:            l.id,
      numero:        l.numero,
      nom:           l.nom,
      montant:       l.montant,
      nombreArticles: l.nombreArticles,
      societe:       { nom: l.societe.nom },
    })),
  }))

  return (
    <>
      <Header title="Acquisitions" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Acquisitions</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {acquisitions.length} acquisition(s)
              {hasFilters && ' trouvée(s) avec les filtres appliqués'}
              {acquisitions.length > 0 && (
                <span className="ml-2 font-medium text-gray-700">
                  — Total&nbsp;: {formatCurrency(totalMontant)}
                </span>
              )}
            </p>
          </div>
          <Link href="/acquisitions/nouveau" className="btn-primary flex-shrink-0">
            <Plus size={15} />
            Ajouter une acquisition
          </Link>
        </div>

        {/* ── Filter bar ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filtres</p>
            {hasFilters && (
              <Link
                href="/acquisitions"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Type */}
            <div>
              <label className="label text-[11px]">Type d&apos;acquisition</label>
              <select name="type" defaultValue={type ?? ''} className="input text-sm">
                <option value="">Tous les types</option>
                {Object.entries(TYPE_ACQUISITION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Code */}
            <div>
              <label className="label text-[11px]">Code</label>
              <input
                name="code"
                defaultValue={code ?? ''}
                placeholder="ACQ-2024-..."
                className="input text-sm"
              />
            </div>

            {/* Date début */}
            <div>
              <label className="label text-[11px]">Date début</label>
              <input
                name="dateDebut"
                type="date"
                defaultValue={dateDebut ?? ''}
                className="input text-sm"
              />
            </div>

            {/* Date fin */}
            <div>
              <label className="label text-[11px]">Date fin</label>
              <input
                name="dateFin"
                type="date"
                defaultValue={dateFin ?? ''}
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

        {/* ── Table (client component) ─────────────────── */}
        <AcquisitionsTable data={rows} />

      </main>
    </>
  )
}
