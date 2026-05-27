import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Phone, Mail } from 'lucide-react'

export default async function SocietesPage() {
  const societes = await prisma.societe.findMany({
    include: {
      _count: { select: { lots: true, reparations: true } },
    },
    orderBy: { nom: 'asc' },
  })

  return (
    <>
      <Header title="Sociétés" />
      <main className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{societes.length} société(s)</p>
          <Link href="/societes/nouvelle" className="btn-primary">
            <Plus size={16} />
            Nouvelle société
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {societes.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-3 py-10 text-center">
              Aucune société enregistrée.
            </p>
          ) : societes.map((s) => (
            <div key={s.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                  {s.nom.charAt(0)}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{s._count.lots} lot(s)</p>
                  <p className="text-xs text-gray-400">{s._count.reparations} réparation(s)</p>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{s.nom}</h3>
              {s.adresse && <p className="text-xs text-gray-400 mb-2">{s.adresse}</p>}
              <div className="flex flex-col gap-1">
                {s.telephone && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone size={11} />
                    {s.telephone}
                  </span>
                )}
                {s.email && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail size={11} />
                    {s.email}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
