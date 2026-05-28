'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createPanne(
  formData: FormData
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const materielId    = parseInt(formData.get('materielId') as string)
    const utilisateurId = parseInt(formData.get('utilisateurId') as string)
    const description   = (formData.get('description') as string).trim()
    const priorite      = formData.get('priorite') as string
    const dateRaw       = formData.get('date') as string
    const date          = dateRaw ? new Date(dateRaw) : new Date()

    if (isNaN(materielId) || isNaN(utilisateurId)) {
      return { success: false, error: 'Matériel et déclarant sont obligatoires.' }
    }
    if (!description) {
      return { success: false, error: 'La description est obligatoire.' }
    }

    const panne = await prisma.$transaction(async (tx) => {
      const p = await tx.panne.create({
        data: { materielId, utilisateurId, description, priorite: priorite as any, date, statut: 'OUVERTE' },
      })

      // Only transition to EN_REPARATION if not already
      const materiel = await tx.materiel.findUnique({ where: { id: materielId }, select: { statut: true } })
      if (materiel && materiel.statut !== 'EN_REPARATION') {
        await tx.etatMateriel.updateMany({
          where: { materielId, dateFin: null },
          data:  { dateFin: date },
        })
        await tx.etatMateriel.create({
          data: { materielId, etat: 'EN_REPARATION', dateDebut: date },
        })
        await tx.materiel.update({
          where: { id: materielId },
          data:  { statut: 'EN_REPARATION' },
        })
      }

      return p
    })

    revalidatePath('/pannes')
    revalidatePath('/materiels')
    return { success: true, id: panne.id }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la création.' }
  }
}

export async function updatePanneStatut(
  id: number,
  statut: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.panne.update({ where: { id }, data: { statut: statut as any } })
    revalidatePath('/pannes')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors du changement de statut.' }
  }
}

export async function deletePanne(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const count = await prisma.reparation.count({ where: { panneId: id } })
    if (count > 0) {
      return { success: false, error: `Impossible de supprimer : ${count} réparation(s) liée(s). Supprimez-les d'abord.` }
    }
    await prisma.panne.delete({ where: { id } })
    revalidatePath('/pannes')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la suppression.' }
  }
}
