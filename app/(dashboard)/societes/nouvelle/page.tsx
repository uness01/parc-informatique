import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

async function createSociete(formData: FormData) {
  'use server'
  await prisma.societe.create({
    data: {
      nom: formData.get('nom') as string,
      telephone: (formData.get('telephone') as string) || null,
      fax: (formData.get('fax') as string) || null,
      email: (formData.get('email') as string) || null,
      adresse: (formData.get('adresse') as string) || null,
    },
  })
  redirect('/societes')
}

export default function NouvelleSocietePage() {
  return (
    <>
      <Header title="Nouvelle société" />
      <main className="flex-1 p-6">
        <Link href="/societes" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Enregistrer une société</h2>
            <form action={createSociete} className="space-y-4">
              <div>
                <label className="label">Raison sociale *</label>
                <input name="nom" required className="input" placeholder="Nom de la société" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Téléphone</label>
                  <input name="telephone" className="input" placeholder="+212 5XX-XXXXXX" />
                </div>
                <div>
                  <label className="label">Fax</label>
                  <input name="fax" className="input" placeholder="+212 5XX-XXXXXX" />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input name="email" type="email" className="input" placeholder="contact@societe.ma" />
              </div>
              <div>
                <label className="label">Adresse</label>
                <textarea name="adresse" rows={2} className="input" placeholder="Adresse complète..."></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Enregistrer</button>
                <Link href="/societes" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
