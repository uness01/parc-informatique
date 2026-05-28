'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcrypt from 'bcryptjs'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Accès interdit')
  }
}

function currentUserId(session: any): number {
  return Number((session?.user as any)?.id)
}

export async function createUtilisateur(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const nom      = (formData.get('nom')    as string).trim()
    const prenom   = (formData.get('prenom') as string).trim()
    const email    = (formData.get('email')  as string).trim().toLowerCase()
    const login    = (formData.get('login')  as string).trim().toLowerCase()
    const password = (formData.get('password') as string)
    const role     = formData.get('role') as string
    const actif    = formData.get('actif') === 'on'

    if (!nom || !prenom || !email || !login || !password || !role) {
      return { success: false, error: 'Tous les champs obligatoires doivent être remplis.' }
    }
    if (password.length < 6) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' }
    }

    const hashed = await bcrypt.hash(password, 10)

    await prisma.utilisateur.create({
      data: { nom, prenom, email, login, password: hashed, role: role as any, actif },
    })

    revalidatePath('/utilisateurs')
    return { success: true }
  } catch (e: any) {
    if (e?.code === 'P2002') return { success: false, error: 'Cet email ou login est déjà utilisé.' }
    return { success: false, error: e.message || 'Une erreur est survenue.' }
  }
}

export async function updateUtilisateur(
  id: number,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()

    const nom    = (formData.get('nom')    as string).trim()
    const prenom = (formData.get('prenom') as string).trim()
    const email  = (formData.get('email')  as string).trim().toLowerCase()
    const login  = (formData.get('login')  as string).trim().toLowerCase()
    const role   = formData.get('role') as string
    const actif  = formData.get('actif') === 'on'

    const data: any = { nom, prenom, email, login, role: role as any, actif }

    const newPassword = (formData.get('password') as string)?.trim()
    if (newPassword) {
      if (newPassword.length < 6) {
        return { success: false, error: 'Le mot de passe doit comporter au moins 6 caractères.' }
      }
      data.password = await bcrypt.hash(newPassword, 10)
    }

    await prisma.utilisateur.update({ where: { id }, data })

    revalidatePath('/utilisateurs')
    return { success: true }
  } catch (e: any) {
    if (e?.code === 'P2002') return { success: false, error: 'Cet email ou login est déjà utilisé.' }
    return { success: false, error: e.message || 'Une erreur est survenue.' }
  }
}

export async function toggleActif(
  id: number,
  actif: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return { success: false, error: 'Accès interdit.' }
    }
    if (id === currentUserId(session)) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre statut.' }
    }

    await prisma.utilisateur.update({ where: { id }, data: { actif } })
    revalidatePath('/utilisateurs')
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message || 'Une erreur est survenue.' }
  }
}

export async function deleteUtilisateur(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return { success: false, error: 'Accès interdit.' }
    }
    if (id === currentUserId(session)) {
      return { success: false, error: 'Vous ne pouvez pas supprimer votre propre compte.' }
    }

    await prisma.utilisateur.delete({ where: { id } })
    revalidatePath('/utilisateurs')
    return { success: true }
  } catch (e: any) {
    if (e?.code === 'P2003') {
      return { success: false, error: 'Impossible de supprimer : cet utilisateur a des données liées.' }
    }
    return { success: false, error: e.message || 'Une erreur est survenue.' }
  }
}
