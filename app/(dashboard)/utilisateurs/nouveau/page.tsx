import { Header } from '@/components/Header'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import bcrypt from 'bcryptjs'
import { ROLE_LABELS } from '@/lib/utils'

async function createUtilisateur(formData: FormData) {
  'use server'
  const password = formData.get('password') as string
  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.utilisateur.create({
    data: {
      nom: formData.get('nom') as string,
      prenom: formData.get('prenom') as string,
      email: formData.get('email') as string,
      password: hashedPassword,
      role: formData.get('role') as any,
      actif: true,
    },
  })
  redirect('/utilisateurs')
}

export default async function NouvelUtilisateurPage() {
  return (
    <>
      <Header title="Nouvel utilisateur" />
      <main className="flex-1 p-6">
        <Link href="/utilisateurs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Retour
        </Link>
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Créer un utilisateur</h2>
            <form action={createUtilisateur} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prénom *</label>
                  <input name="prenom" required className="input" placeholder="Mohamed" />
                </div>
                <div>
                  <label className="label">Nom *</label>
                  <input name="nom" required className="input" placeholder="ALAMI" />
                </div>
              </div>
              <div>
                <label className="label">Adresse email *</label>
                <input name="email" type="email" required className="input" placeholder="m.alami@energie.gov.ma" />
              </div>
              <div>
                <label className="label">Mot de passe *</label>
                <input name="password" type="password" required minLength={6} className="input" placeholder="Minimum 6 caractères" />
              </div>
              <div>
                <label className="label">Rôle *</label>
                <select name="role" required className="input">
                  {Object.entries(ROLE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="btn-primary">Créer</button>
                <Link href="/utilisateurs" className="btn-secondary">Annuler</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
