import Link from 'next/link'
import { FileQuestion, LayoutDashboard } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">

      {/* Icon */}
      <div className="w-24 h-24 rounded-3xl bg-amber-50 flex items-center justify-center mb-8">
        <FileQuestion size={44} className="text-amber-400" />
      </div>

      {/* Code */}
      <p className="text-[80px] font-black leading-none text-amber-100 select-none mb-2">
        404
      </p>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Page introuvable
      </h1>

      {/* Message */}
      <p className="text-sm text-gray-500 max-w-xs mb-8 leading-relaxed">
        La page que vous recherchez n&apos;existe pas ou a été déplacée.
        Vérifiez l&apos;adresse ou revenez au tableau de bord.
      </p>

      {/* CTA */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors shadow-sm"
      >
        <LayoutDashboard size={15} />
        Retour au tableau de bord
      </Link>

    </div>
  )
}
