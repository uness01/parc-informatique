import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canDo } from '@/lib/permissions'
import {
  ArrowLeft, Wrench, Pencil, Monitor, User, Calendar,
  AlertTriangle, Clock,
} from 'lucide-react'
import {
  STATUT_PANNE_LABELS, STATUT_PANNE_COLORS,
  PRIORITE_LABELS, PRIORITE_COLORS,
  STATUT_REPARATION_LABELS, STATUT_REPARATION_COLORS,
  formatDate, formatCurrency,
} from '@/lib/utils'

export default async function PanneDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'CONSULTANT'
  const canModifier = canDo(role, 'pannes', 'modifier')

  const panne = await prisma.panne.findUnique({
    where: { id },
    include: {
      materiel: { include: { article: true } },
      utilisateur: true,
      reparations: {
        include: { technicien: true, societe: true },
        orderBy: { dateDebut: 'desc' },
      },
    },
  })
  if (!panne) notFound()

  return (
    <>
      <Header title={`Panne #${panne.id}`} />
      <main className="flex-1 p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/pannes"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux pannes
          </Link>
          {canModifier && (
            <Link href={`/pannes/${id}/modifier`} className="btn-primary">
              <Pencil size={14} />
              Modifier
            </Link>
          )}
        </div>

        {/* Header card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Wrench size={22} className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{panne.id}</span>
                <span className={`badge text-[10px] ${PRIORITE_COLORS[panne.priorite] ?? 'bg-gray-100 text-gray-700'}`}>
                  {PRIORITE_LABELS[panne.priorite] ?? panne.priorite}
                </span>
                <span className={`badge text-[10px] ${STATUT_PANNE_COLORS[panne.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                  {STATUT_PANNE_LABELS[panne.statut] ?? panne.statut}
                </span>
              </div>
              <p className="text-base font-semibold text-gray-900 leading-snug">{panne.description}</p>
              <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                <Calendar size={11} />
                Déclarée le {formatDate(panne.date.toISOString())}
                {' · '}
                <User size={11} />
                {panne.utilisateur.prenom} {panne.utilisateur.nom}
              </p>
            </div>
          </div>
        </div>

        {/* Matériel */}
        <div className="card">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Monitor size={14} />Matériel concerné
          </h3>
          <div className="flex items-center gap-3">
            <div>
              <Link
                href={`/materiels/${panne.materiel.id}`}
                className="font-mono font-bold text-gray-900 hover:text-green-700 transition-colors"
              >
                {panne.materiel.numeroInventaire}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">
                {panne.materiel.article.designation} · {panne.materiel.article.marque}
              </p>
            </div>
            <Link
              href={`/materiels/${panne.materiel.id}`}
              className="ml-auto text-xs text-green-700 hover:underline"
            >
              Voir la fiche →
            </Link>
          </div>
        </div>

        {/* Réparations */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle size={16} className="text-orange-500" />
              Réparations ({panne.reparations.length})
            </h2>
            <Link href={`/reparations/nouvelle?panneId=${panne.id}`} className="btn-primary">
              + Nouvelle réparation
            </Link>
          </div>

          {panne.reparations.length === 0 ? (
            <div className="card flex flex-col items-center py-10 gap-3 text-gray-400">
              <Clock size={36} className="opacity-20" />
              <p className="text-sm font-medium">Aucune réparation enregistrée</p>
            </div>
          ) : (
            <div className="space-y-3">
              {panne.reparations.map((r) => (
                <div key={r.id} className="card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-mono font-bold text-gray-900">{r.codeBon}</span>
                        <span className={`badge text-[10px] ${STATUT_REPARATION_COLORS[r.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                          {STATUT_REPARATION_LABELS[r.statut] ?? r.statut}
                        </span>
                        <span className="badge text-[10px] bg-gray-100 text-gray-600">
                          {r.typeMaintenance === 'CORRECTIVE' ? 'Corrective' : 'Préventive'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {r.societe.nom} · {r.technicien.prenom} {r.technicien.nom}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(r.dateDebut.toISOString())}
                        {r.dateFin ? ` → ${formatDate(r.dateFin.toISOString())}` : ' · En cours'}
                        {r.cout != null && ` · ${formatCurrency(r.cout)}`}
                      </p>
                    </div>
                    <Link
                      href={`/reparations/${r.id}`}
                      className="text-xs text-green-700 hover:underline flex-shrink-0"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}
