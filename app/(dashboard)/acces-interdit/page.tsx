import Link from 'next/link'
import { ShieldOff, ArrowLeft } from 'lucide-react'

export default function AccesInterditPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
        <ShieldOff size={36} className="text-red-400" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        Veuillez contacter un administrateur.
      </p>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <ArrowLeft size={15} />
          Retour au tableau de bord
        </Link>
      </div>

      <p className="mt-8 text-xs text-gray-300">Erreur 403 — Accès interdit</p>
    </main>
  )
}
