import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import {
  Monitor, ShoppingCart, AlertTriangle, Shield,
  CheckCircle, MapPin, ArrowRight,
  Calendar, User, TrendingUp, Activity,
} from 'lucide-react'
import {
  STATUT_PANNE_LABELS, STATUT_PANNE_COLORS,
  PRIORITE_LABELS, PRIORITE_COLORS,
  formatDate, formatCurrency,
} from '@/lib/utils'

// ─── Data ─────────────────────────────────────────────────────

async function getStats() {
  const now = new Date()

  const [
    totalMateriels,
    disponibles,
    affectes,
    enReparation,
    reformes,
    totalAcquisitions,
    montantAgg,
    pannesOuvertes,
    pannesEnCours,
    pannesCritiques,
    enGarantie,
    recentPannes,
    recentAffectations,
  ] = await Promise.all([
    prisma.materiel.count(),
    prisma.materiel.count({ where: { statut: 'DISPONIBLE' } }),
    prisma.materiel.count({ where: { statut: 'AFFECTE' } }),
    prisma.materiel.count({ where: { statut: 'EN_REPARATION' } }),
    prisma.materiel.count({ where: { statut: 'REFORME' } }),
    prisma.acquisition.count(),
    prisma.acquisition.aggregate({ _sum: { montant: true } }),
    prisma.panne.count({ where: { statut: 'OUVERTE' } }),
    prisma.panne.count({ where: { statut: 'EN_COURS' } }),
    prisma.panne.count({
      where: { statut: { in: ['OUVERTE', 'EN_COURS'] }, priorite: 'CRITIQUE' },
    }),
    prisma.materiel.count({
      where: { dateFinGarantie: { gte: now } },
    }),
    prisma.panne.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      include: {
        materiel: { include: { article: true } },
        utilisateur: true,
      },
    }),
    prisma.affectation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        materiel: { include: { article: true } },
        utilisateur: true,
      },
    }),
  ])

  return {
    totalMateriels,
    disponibles,
    affectes,
    enReparation,
    reformes,
    totalAcquisitions,
    montantTotal: montantAgg._sum.montant ?? 0,
    pannesOuvertes,
    pannesEnCours,
    pannesCritiques,
    totalPannesActives: pannesOuvertes + pannesEnCours,
    enGarantie,
    horsGarantie: totalMateriels - enGarantie,
    recentPannes,
    recentAffectations,
  }
}

// ─── Helpers ──────────────────────────────────────────────────

function pct(part: number, total: number) {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

function todayFr() {
  const s = new Intl.DateTimeFormat('fr-MA', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Sub-components ───────────────────────────────────────────

function ProgressRow({
  label,
  value,
  total,
  barColor,
  textColor,
}: {
  label: string
  value: number
  total: number
  barColor: string
  textColor: string
}) {
  const width = pct(value, total)
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-500 font-medium">{label}</span>
        <span className={`font-semibold ${textColor}`}>
          {value}
          <span className="text-gray-400 font-normal ml-1">({width}%)</span>
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [session, stats] = await Promise.all([
    getServerSession(authOptions),
    getStats(),
  ])

  const firstName = session?.user?.name?.split(' ')[0] ?? 'Utilisateur'

  return (
    <>
      <Header title="Tableau de bord" />

      <main className="flex-1 p-6 space-y-6 bg-gray-50 min-h-full">

        {/* ── Welcome banner ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-800 via-green-800 to-green-900 px-7 py-6 shadow-lg">
          {/* decorative rings */}
          <span className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full border-[3px] border-white/10" />
          <span className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full border-[3px] border-white/10" />
          <span className="pointer-events-none absolute top-6 right-40 w-28 h-28 rounded-full border-[3px] border-white/10" />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-green-300 text-xs font-medium mb-1 tracking-wide uppercase">
                {todayFr()}
              </p>
              <h2 className="text-2xl font-bold text-white">
                Bonjour, {firstName}&nbsp;👋
              </h2>
              <p className="text-green-200 text-sm mt-1.5 max-w-lg leading-relaxed">
                Ministère de la Transition Énergétique et du Développement Durable
                &nbsp;—&nbsp; Gestion du Parc Informatique
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-green-300 text-xs">Matériels actifs</p>
                <p className="text-white text-3xl font-bold">
                  {stats.disponibles + stats.affectes}
                </p>
              </div>
              <div className="h-14 w-px bg-white/20" />
              <div className="text-right">
                <p className="text-green-300 text-xs">Pannes ouvertes</p>
                <p className={`text-3xl font-bold ${stats.totalPannesActives > 0 ? 'text-red-300' : 'text-white'}`}>
                  {stats.totalPannesActives}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* Card 1 — Total matériels with breakdown */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Total Matériels
                </p>
                <p className="text-4xl font-extrabold text-gray-900 mt-1 leading-none">
                  {stats.totalMateriels}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <Monitor size={21} className="text-violet-600" />
              </div>
            </div>

            <div className="space-y-2.5">
              <ProgressRow
                label="Disponibles"
                value={stats.disponibles}
                total={stats.totalMateriels}
                barColor="bg-emerald-500"
                textColor="text-emerald-700"
              />
              <ProgressRow
                label="Affectés"
                value={stats.affectes}
                total={stats.totalMateriels}
                barColor="bg-blue-500"
                textColor="text-blue-700"
              />
              <ProgressRow
                label="En réparation"
                value={stats.enReparation}
                total={stats.totalMateriels}
                barColor="bg-orange-500"
                textColor="text-orange-700"
              />
              <ProgressRow
                label="Réformés"
                value={stats.reformes}
                total={stats.totalMateriels}
                barColor="bg-gray-400"
                textColor="text-gray-500"
              />
            </div>
          </div>

          {/* Card 2 — Acquisitions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Acquisitions
                </p>
                <p className="text-4xl font-extrabold text-gray-900 mt-1 leading-none">
                  {stats.totalAcquisitions}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <ShoppingCart size={21} className="text-green-700" />
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-end gap-3">
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={13} className="text-green-600" />
                  <p className="text-xs font-semibold text-green-700">Montant total engagé</p>
                </div>
                <p className="text-xl font-extrabold text-green-800">
                  {formatCurrency(stats.montantTotal)}
                </p>
              </div>
              <Link
                href="/acquisitions"
                className="flex items-center justify-between text-xs text-green-700 font-semibold hover:text-green-900 group"
              >
                Voir toutes les acquisitions
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3 — Pannes actives */}
          <div className={`rounded-2xl border shadow-sm p-5 flex flex-col gap-4 ${
            stats.totalPannesActives > 0
              ? 'bg-white border-red-100'
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Pannes actives
                </p>
                <p className={`text-4xl font-extrabold mt-1 leading-none ${
                  stats.totalPannesActives > 0 ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {stats.totalPannesActives}
                </p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                stats.totalPannesActives > 0 ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <AlertTriangle size={21} className={stats.totalPannesActives > 0 ? 'text-red-500' : 'text-gray-400'} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                <span className="flex items-center gap-2 text-xs font-medium text-red-700">
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                  Ouvertes
                </span>
                <span className="text-sm font-bold text-red-700">{stats.pannesOuvertes}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2">
                <span className="flex items-center gap-2 text-xs font-medium text-orange-700">
                  <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                  En cours
                </span>
                <span className="text-sm font-bold text-orange-700">{stats.pannesEnCours}</span>
              </div>
              {stats.pannesCritiques > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-red-100 border border-red-200 px-3 py-2">
                  <span className="text-xs font-bold text-red-800">⚠ Critiques</span>
                  <span className="text-sm font-bold text-red-800">{stats.pannesCritiques}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 4 — Garantie */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Garantie matériels
                </p>
                <p className="text-4xl font-extrabold text-gray-900 mt-1 leading-none">
                  {stats.enGarantie}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Shield size={21} className="text-teal-600" />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 font-medium text-teal-700">
                    <CheckCircle size={11} />
                    En garantie
                  </span>
                  <span className="font-bold text-teal-700">
                    {stats.enGarantie}
                    <span className="text-teal-500 font-normal ml-1">
                      ({pct(stats.enGarantie, stats.totalMateriels)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2.5 rounded-full bg-teal-500 transition-all duration-500"
                    style={{ width: `${pct(stats.enGarantie, stats.totalMateriels)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-500">Hors garantie / N.R.</span>
                  <span className="font-bold text-gray-600">
                    {stats.horsGarantie}
                    <span className="text-gray-400 font-normal ml-1">
                      ({pct(stats.horsGarantie, stats.totalMateriels)}%)
                    </span>
                  </span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2.5 rounded-full bg-gray-300 transition-all duration-500"
                    style={{ width: `${pct(stats.horsGarantie, stats.totalMateriels)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent activity ─────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Recent pannes */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Dernières pannes</h3>
                  <p className="text-[11px] text-gray-400">5 plus récentes</p>
                </div>
              </div>
              <Link
                href="/pannes"
                className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 group"
              >
                Voir tout
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Rows */}
            <div className="flex-1 divide-y divide-gray-50">
              {stats.recentPannes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">Aucune panne enregistrée</p>
                </div>
              ) : (
                stats.recentPannes.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          #{p.id}
                        </span>
                        <span className={`badge text-[10px] ${PRIORITE_COLORS[p.priorite]}`}>
                          {PRIORITE_LABELS[p.priorite]}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {p.materiel.article.designation}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5 max-w-[230px]">
                        {p.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-400">
                        <User size={10} />
                        {p.utilisateur.prenom} {p.utilisateur.nom}
                      </div>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`badge text-[10px] ${STATUT_PANNE_COLORS[p.statut]}`}>
                        {STATUT_PANNE_LABELS[p.statut]}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar size={10} />
                        {formatDate(p.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <Link
                href="/pannes/nouvelle"
                className="text-xs font-semibold text-green-700 hover:text-green-900"
              >
                + Déclarer une panne
              </Link>
            </div>
          </div>

          {/* Recent affectations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <MapPin size={15} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Dernières affectations</h3>
                  <p className="text-[11px] text-gray-400">5 plus récentes</p>
                </div>
              </div>
              <Link
                href="/affectations"
                className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 group"
              >
                Voir tout
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Rows */}
            <div className="flex-1 divide-y divide-gray-50">
              {stats.recentAffectations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Activity size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">Aucune affectation enregistrée</p>
                </div>
              ) : (
                stats.recentAffectations.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {a.materiel.article.designation}
                      </p>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                        {a.materiel.numeroInventaire}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                        <MapPin size={10} className="flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{a.direction} — {a.entite}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
                        <User size={10} />
                        {a.utilisateur.prenom} {a.utilisateur.nom}
                      </div>
                    </div>
                    <div className="ml-3 flex flex-col items-end gap-1.5 flex-shrink-0">
                      {!a.dateFin ? (
                        <span className="badge bg-green-100 text-green-700 text-[10px]">En cours</span>
                      ) : (
                        <span className="badge bg-gray-100 text-gray-600 text-[10px]">Terminée</span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-gray-400">
                        <Calendar size={10} />
                        {formatDate(a.dateDebut)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
              <Link
                href="/affectations/nouvelle"
                className="text-xs font-semibold text-green-700 hover:text-green-900"
              >
                + Nouvelle affectation
              </Link>
            </div>
          </div>
        </div>

      </main>
    </>
  )
}
