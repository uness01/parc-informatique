'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createLivraison(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const lotId        = parseInt(formData.get('lotId') as string)
    const numeroBL     = (formData.get('numeroBL') as string).trim()
    const dateLivraison = new Date(formData.get('dateLivraison') as string)
    const articleLivre  = formData.get('articleLivre') === 'oui'

    if (isNaN(lotId)) {
      return { success: false, error: 'Veuillez sélectionner un lot.' }
    }

    await prisma.livraison.create({
      data: { lotId, numeroBL, dateLivraison, articleLivre },
    })
    revalidatePath('/livraisons')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la création.' }
  }
}

export async function deleteLivraison(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const materielsCount = await prisma.materiel.count({ where: { livraisonId: id } })
    if (materielsCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : cette livraison est liée à ${materielsCount} matériel(s). Supprimez-les d'abord.`,
      }
    }
    await prisma.livraison.delete({ where: { id } })
    revalidatePath('/livraisons')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la suppression.' }
  }
}
