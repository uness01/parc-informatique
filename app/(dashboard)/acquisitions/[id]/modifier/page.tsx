import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'

// ─── Server action ────────────────────────────────────────────

async function updateAcquisition(id: number, formData: FormData) {
  'use server'

  const code       = (formData.get('code') as string).trim()
  const type       = formData.get('type') as string
  const date       = formData.get('date') as string
  const montant    = parseFloat(formData.get('montant') as string)
  const nombreLots = parseInt(formData.get('nombreLots') as string)

  // Check code uniqueness (excluding current record)
  const existing = await prisma.acquisition.findFirst({
    where: { code, NOT: { id } },
  })
  if (existing) {
    redirect(`/acquisitions/${id}/modifier?error=Code+déjà+utilisé`)
  }

  await prisma.acquisition.update({
    where: { id },
    data: {
      code,
      type: type as any,
      date: new Date(date),
      montant,
      nombreLots,
    },
  })
  redirect(`/acquisitions/${id}?updated=1`)
}

// ─── Page ─────────────────────────────────────────────────────

export default async function ModifierAcquisitionPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { error?: string }
}) {
  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const acquisition = await prisma.acquisition.findUnique({ where: { id } })
  if (!acquisition) notFound()

  const action = updateAcquisition.bind(null, id)

  return (
    <>
      <Header title="Modifier une acquisition" />
      <main className="flex-1 p-6">

        {/* Breadcrumb */}
        <Link
          href={`/acquisitions/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 group"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Retour aux détails
        </Link>

        <div className="max-w-xl">
          {/* Error banner */}
          {searchParams.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {decodeURIComponent(searchParams.error)}
            </div>
          )}

          <div className="card">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Modifier l&apos;acquisition</h2>
                <p className="text-xs text-gray-400 font-mono">{acquisition.code}</p>
              </div>
            </div>

            <form action={action} className="space-y-5">

              {/* Type */}
              <div>
                <label className="label" htmlFor="type">
                  Type d&apos;acquisition <span className="text-red-500">*</span>
                </label>
                <select id="type" name="type" required className="input" defaultValue={acquisition.type}>
                  <option value="MARCHE">Marché</option>
                  <option value="BON_DE_COMMANDE">Bon de commande</option>
                  <option value="DON">Don</option>
                </select>
              </div>

              {/* Code */}
              <div>
                <label className="label" htmlFor="code">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="code"
                  name="code"
                  required
                  className="input font-mono"
                  placeholder="ACQ-2024-001"
                  pattern="[A-Za-z0-9\-]+"
                  title="Lettres, chiffres et tirets uniquement"
                  defaultValue={acquisition.code}
                />
                <p className="mt-1 text-[11px] text-gray-400">Identifiant unique de l&apos;acquisition</p>
              </div>

              {/* Date */}
              <div>
                <label className="label" htmlFor="date">
                  Date de l&apos;acquisition <span className="text-red-500">*</span>
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  className="input"
                  defaultValue={acquisition.date.toISOString().split('T')[0]}
                />
              </div>

              {/* Montant + Nombre de lots side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="montant">
                    Montant global (MAD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="montant"
                      name="montant"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      className="input pr-14"
                      placeholder="0.00"
                      defaultValue={acquisition.montant}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">
                      MAD
                    </span>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="nombreLots">
                    Nombre de lots <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombreLots"
                    name="nombreLots"
                    type="number"
                    min="1"
                    required
                    className="input"
                    placeholder="1"
                    defaultValue={acquisition.nombreLots}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button type="submit" className="btn-primary flex-1 justify-center">
                  Enregistrer les modifications
                </button>
                <Link href={`/acquisitions/${id}`} className="btn-secondary flex-1 justify-center">
                  Annuler
                </Link>
              </div>

            </form>
          </div>
        </div>
      </main>
    </>
  )
}
