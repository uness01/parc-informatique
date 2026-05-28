import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { Plus, SlidersHorizontal, X } from 'lucide-react'
import { STATUT_REPARATION_LABELS } from '@/lib/utils'
import { ReparationsTable } from '@/components/ReparationsTable'
import { canDo } from '@/lib/permissions'

// ─── Types ────────────────────────────────────────────────────

type SearchParams = {
  panneId?:  string
  statut?:   string
  type?:     string
  societeId?: string
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ReparationsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'CONSULTANT'
  const canAjouter   = canDo(role, 'reparations', 'ajouter')
  const canModifier  = canDo(role, 'reparations', 'modifier')
  const canSupprimer = canDo(role, 'reparations', 'supprimer')

  const { panneId, statut, type, societeId } = searchParams

  const hasFilters = !!(panneId || statut || type || societeId)

  const where: Record<string, any> = {}
  if (panneId)   where.panneId          = Number(panneId)
  if (statut)    where.statut           = statut
  if (type)      where.typeMaintenance  = type
  if (societeId) where.societeId        = Number(societeId)

  const [reparations, societes] = await Promise.all([
    prisma.reparation.findMany({
      where,
      include: {
        panne: {
          include: {
            materiel: { include: { article: true } },
          },
        },
        technicien: true,
        societe:    true,
      },
      orderBy: { dateDebut: 'desc' },
    }),
    prisma.societe.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true } }),
  ])

  const rows = reparations.map((r) => ({
    id:              r.id,
    codeBon:         r.codeBon,
    typeMaintenance: r.typeMaintenance,
    statut:          r.statut,
    dateDebut:       r.dateDebut.toISOString(),
    dateFin:         r.dateFin?.toISOString() ?? null,
    cout:            r.cout ?? null,
    panne: {
      id:          r.panne.id,
      description: r.panne.description,
      materiel: {
        id:               r.panne.materiel.id,
        numeroInventaire: r.panne.materiel.numeroInventaire,
        article: {
          designation: r.panne.materiel.article.designation,
          marque:      r.panne.materiel.article.marque,
        },
      },
    },
    technicien: { nom: r.technicien.nom, prenom: r.technicien.prenom },
    societe:    { nom: r.societe.nom },
  }))

  const enCoursCount  = reparations.filter((r) => r.statut === 'EN_COURS').length
  const termineesCount = reparations.filter((r) => r.statut === 'TERMINEE').length

  return (
    <>
      <Header title="Réparations" />
      <main className="flex-1 p-6 space-y-5">

        {/* ── Top bar ──────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Réparations</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {reparations.length} réparation(s)
              {hasFilters && ' trouvée(s) avec les filtres appliqués'}
              {reparations.length > 0 && (
                <span className="ml-2 font-medium">
                  {enCoursCount   > 0 && <span className="text-orange-600"> — {enCoursCount} en cours</span>}
                  {termineesCount > 0 && <span className="text-green-700"> · {termineesCount} terminée(s)</span>}
                </span>
              )}
            </p>
          </div>
          {canAjouter && (
            <Link href="/reparations/nouvelle" className="btn-primary flex-shrink-0">
              <Plus size={15} />
              Nouvelle réparation
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
                href="/reparations"
                className="ml-auto inline-flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={12} />
                Réinitialiser
              </Link>
            )}
          </div>

          <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            {/* Statut */}
            <div>
              <label className="label text-[11px]">Statut</label>
              <select name="statut" defaultValue={statut ?? ''} className="input text-sm">
                <option value="">Tous les statuts</option>
                {Object.entries(STATUT_REPARATION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {/* Type maintenance */}
            <div>
              <label className="label text-[11px]">Type de maintenance</label>
              <select name="type" defaultValue={type ?? ''} className="input text-sm">
                <option value="">Tous les types</option>
                <option value="CORRECTIVE">Corrective</option>
                <option value="PREVENTIVE">Préventive</option>
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

            {/* Submit */}
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full justify-center">
                Rechercher
              </button>
            </div>

          </form>
        </div>

        {/* ── Table ────────────────────────────────────── */}
        <ReparationsTable data={rows} canModifier={canModifier} canSupprimer={canSupprimer} />

      </main>
    </>
  )
}
