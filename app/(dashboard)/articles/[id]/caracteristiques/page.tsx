import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag, Settings2, ShieldCheck, ShieldOff, CreditCard, Hash, Layers } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CaracteristiquesManager } from '@/components/CaracteristiquesManager'

export default async function CaracteristiquesPage({
  params,
}: {
  params: { id: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [article, nomRows] = await Promise.all([
    prisma.article.findUnique({
      where: { id },
      include: {
        lot: {
          include: { acquisition: { select: { id: true, code: true } } },
        },
        caracteristiques: { orderBy: { nom: 'asc' } },
      },
    }),
    prisma.caracteristique.findMany({
      distinct: ['nom'],
      select:   { nom: true },
      orderBy:  { nom: 'asc' },
    }),
  ])

  if (!article) notFound()

  const today        = new Date()
  const isEnGarantie = article.dateFinGarantie ? article.dateFinGarantie > today : false
  const distinctNoms = nomRows.map((r) => r.nom)

  return (
    <>
      <Header title="Caractéristiques" />
      <main className="flex-1 p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Retour aux articles
          </Link>
          <Link
            href={`/articles/${id}/modifier`}
            className="btn-secondary text-xs py-1.5 px-3"
          >
            Modifier l&apos;article
          </Link>
        </div>

        {/* ── Article info card ─────────────────────────── */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
              <Tag size={22} className="text-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                  #{article.id}
                </span>
                <span className="text-xs font-mono font-bold text-gray-600">{article.numero}</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{article.designation}</h1>
              <p className="text-sm text-gray-500">{article.marque} — {article.modele}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1 text-gray-400">
                <Layers size={12} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Lot</span>
              </div>
              <Link
                href={`/lots/${article.lot.id}`}
                className="text-sm font-bold text-gray-800 font-mono hover:text-green-700 transition-colors"
              >
                {article.lot.numero}
              </Link>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1 text-gray-400">
                <Hash size={12} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Qté prévue</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{article.nombreMateriel}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1 text-gray-400">
                <CreditCard size={12} />
                <span className="text-[11px] font-semibold uppercase tracking-wide">P.U TTC</span>
              </div>
              <p className="text-sm font-bold text-gray-800">{formatCurrency(article.prixUnitaire)}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1 text-gray-400">
                {isEnGarantie ? <ShieldCheck size={12} /> : <ShieldOff size={12} />}
                <span className="text-[11px] font-semibold uppercase tracking-wide">Garantie</span>
              </div>
              {article.dateFinGarantie ? (
                <div>
                  <span className={`badge text-[10px] ${isEnGarantie ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                    {isEnGarantie ? 'En garantie' : 'Expirée'}
                  </span>
                  <p className="text-[11px] text-gray-400 mt-0.5">{formatDate(article.dateFinGarantie.toISOString())}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-300">—</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Caractéristiques section ──────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Settings2 size={16} className="text-purple-600" />
            <h2 className="text-base font-bold text-gray-800">
              Caractéristiques techniques
            </h2>
            {article.caracteristiques.length > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {article.caracteristiques.length}
              </span>
            )}
          </div>

          <CaracteristiquesManager
            articleId={id}
            initialCaracteristiques={article.caracteristiques}
            distinctNoms={distinctNoms}
          />
        </div>

      </main>
    </>
  )
}
