'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createLot(formData: FormData) {
  const numero         = (formData.get('numero') as string).trim()
  const nom            = (formData.get('nom') as string).trim()
  const acquisitionId  = parseInt(formData.get('acquisitionId') as string)
  const societeId      = parseInt(formData.get('societeId') as string)
  const montant        = parseFloat(formData.get('montant') as string)
  const nombreArticles = parseInt(formData.get('nombreArticles') as string)

  await prisma.lot.create({
    data: { numero, nom, acquisitionId, societeId, montant, nombreArticles },
  })
  redirect('/lots')
}

export async function deleteLot(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const articlesCount = await prisma.article.count({ where: { lotId: id } })
    if (articlesCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : ce lot contient ${articlesCount} article(s). Supprimez-les d'abord.`,
      }
    }
    const livraisonsCount = await prisma.livraison.count({ where: { lotId: id } })
    if (livraisonsCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : ce lot est lié à ${livraisonsCount} livraison(s). Supprimez-les d'abord.`,
      }
    }
    await prisma.lot.delete({ where: { id } })
    revalidatePath('/lots')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la suppression.' }
  }
}

export async function createSociete(data: {
  nom: string
  telephone?: string
  fax?: string
  email?: string
  adresse?: string
}): Promise<{ success: boolean; id?: number; nom?: string; error?: string }> {
  try {
    const societe = await prisma.societe.create({ data })
    revalidatePath('/lots/nouveau')
    return { success: true, id: societe.id, nom: societe.nom }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la création de la société.' }
  }
}
