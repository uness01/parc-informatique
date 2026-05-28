import Link from 'next/link'
import { ShieldOff, LayoutDashboard } from 'lucide-react'

export default function AccesInterditPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">

      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center">
          <ShieldOff size={44} className="text-red-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-black">!</span>
        </div>
      </div>

      {/* Code */}
      <p className="text-[80px] font-black leading-none text-red-100 select-none mb-2">
        403
      </p>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Accès refusé
      </h1>

      {/* Message */}
      <p className="text-sm text-gray-500 max-w-xs mb-8 leading-relaxed">
        Vous n&apos;avez pas l&apos;autorisation d&apos;accéder à cette page.
        Veuillez contacter un administrateur si vous pensez qu&apos;il s&apos;agit d&apos;une erreur.
      </p>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm"
      >
        <LayoutDashboard size={15} />
        Retour au tableau de bord
      </Link>

    </main>
  )
}
