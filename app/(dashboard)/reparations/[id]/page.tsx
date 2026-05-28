import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { canDo } from '@/lib/permissions'
import { ArrowLeft, Wrench, Pencil, Monitor, User, Calendar, Building2, FileText } from 'lucide-react'
import {
  STATUT_REPARATION_LABELS, STATUT_REPARATION_COLORS,
  STATUT_PANNE_LABELS, STATUT_PANNE_COLORS,
  PRIORITE_LABELS, PRIORITE_COLORS,
  formatDate, formatCurrency,
} from '@/lib/utils'

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800">{children}</span>
    </div>
  )
}

export default async function ReparationDetailPage({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role ?? 'CONSULTANT'
  const canModifier = canDo(role, 'reparations', 'modifier')

  const r = await prisma.reparation.findUnique({
    where: { id },
    include: {
      panne: {
        include: {
          materiel: { include: { article: true } },
          utilisateur: true,
        },
      },
      technicien: true,
      societe:    true,
    },
  })
  if (!r) notFound()

  const TYPE_LABELS: Record<string, string> = {
    CORRECTIVE: 'Corrective',
    PREVENTIVE: 'Préventive',
  }

  return (
    <>
      <Header title={`Réparation ${r.codeBon}`} />
      <main className="flex-1 p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/reparations"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux réparations
          </Link>
          {canModifier && (
            <Link href={`/reparations/${id}/modifier`} className="btn-primary">
              <Pencil size={14} />
              Modifier
            </Link>
          )}
        </div>

        {/* Header card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Wrench size={22} className="text-orange-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">#{r.id}</span>
                <span className={`badge text-[10px] ${STATUT_REPARATION_COLORS[r.statut] ?? 'bg-gray-100 text-gray-700'}`}>
                  {STATUT_REPARATION_LABELS[r.statut] ?? r.statut}
                </span>
                <span className="badge text-[10px] bg-gray-100 text-gray-600">
                  {TYPE_LABELS[r.typeMaintenance] ?? r.typeMaintenance}
                </span>
              </div>
              <h1 className="text-xl font-bold font-mono text-gray-900">{r.codeBon}</h1>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
            <InfoRow label="Date début">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-gray-400" />
                {formatDate(r.dateDebut.toISOString())}
              </span>
            </InfoRow>
            <InfoRow label="Date fin">
              {r.dateFin ? (
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-gray-400" />
                  {formatDate(r.dateFin.toISOString())}
                </span>
              ) : (
                <span className="text-orange-600 font-medium text-sm">En cours</span>
              )}
            </InfoRow>
            <InfoRow label="Coût">
              {r.cout != null ? (
                <span className="font-semibold">{formatCurrency(r.cout)}</span>
              ) : (
                <span className="text-gray-400">—</span>
              )}
            </InfoRow>
            <InfoRow label="Durée">
              {(() => {
                const start = new Date(r.dateDebut)
                const end   = r.dateFin ? new Date(r.dateFin) : new Date()
                const days  = Math.floor((end.getTime() - start.getTime()) / 86400000)
                return <span>{days} jour(s)</span>
              })()}
            </InfoRow>
          </div>

          {r.rapport && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                <FileText size={11} />Rapport d&apos;intervention
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">{r.rapport}</p>
            </div>
          )}
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Panne */}
          <div className="card">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Wrench size={14} />Panne associée
            </h3>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/pannes/${r.panne.id}`}
                  className="text-sm font-mono font-bold text-orange-600 hover:text-orange-800 transition-colors"
                >
                  #{r.panne.id}
                </Link>
                <span className={`badge text-[10px] ${PRIORITE_COLORS[r.panne.priorite]}`}>
                  {PRIORITE_LABELS[r.panne.priorite]}
                </span>
                <span className={`badge text-[10px] ${STATUT_PANNE_COLORS[r.panne.statut]}`}>
                  {STATUT_PANNE_LABELS[r.panne.statut]}
                </span>
              </div>
              <p className="text-sm text-gray-700">{r.panne.description}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <User size={10} />
                Déclaré par {r.panne.utilisateur.prenom} {r.panne.utilisateur.nom}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Monitor size={11} />Matériel
              </p>
              <Link
                href={`/materiels/${r.panne.materiel.id}`}
                className="font-mono font-bold text-gray-900 hover:text-green-700 transition-colors"
              >
                {r.panne.materiel.numeroInventaire}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">
                {r.panne.materiel.article.designation} · {r.panne.materiel.article.marque}
              </p>
            </div>
          </div>

          {/* Intervenant + Société */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <User size={14} />Technicien
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                {r.technicien.prenom} {r.technicien.nom}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{r.technicien.email}</p>
            </div>

            <div className="card">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Building2 size={14} />Société
              </h3>
              <p className="text-sm font-semibold text-gray-900">{r.societe.nom}</p>
              {r.societe.telephone && (
                <p className="text-xs text-gray-400 mt-0.5">{r.societe.telephone}</p>
              )}
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
