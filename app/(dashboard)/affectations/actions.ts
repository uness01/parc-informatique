'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createAffectation(
  formData: FormData
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const materielId    = parseInt(formData.get('materielId') as string)
    const utilisateurId = parseInt(formData.get('utilisateurId') as string)
    const direction     = (formData.get('direction') as string).trim()
    const entite        = (formData.get('entite') as string).trim()
    const batiment      = (formData.get('batiment') as string)?.trim() || null
    const etage         = (formData.get('etage') as string)?.trim() || null
    const bureau        = (formData.get('bureau') as string)?.trim() || null
    const commentaire   = (formData.get('commentaire') as string)?.trim() || null
    const dateDebut     = new Date(formData.get('dateDebut') as string)
    const cloturee      = formData.get('cloturee') === 'oui'
    const dateFinRaw    = formData.get('dateFin') as string
    const dateFin       = cloturee && dateFinRaw ? new Date(dateFinRaw) : null
    const etatRetour    = cloturee ? ((formData.get('etatRetour') as string) || null) : null

    if (isNaN(materielId) || isNaN(utilisateurId)) {
      return { success: false, error: 'Matériel et utilisateur sont obligatoires.' }
    }
    if (!direction || !entite) {
      return { success: false, error: 'Direction et entité sont obligatoires.' }
    }
    if (cloturee && !dateFin) {
      return { success: false, error: 'La date de fin est obligatoire pour clôturer.' }
    }

    // Block if materiel already has an active affectation (only for active, not historical)
    if (!cloturee) {
      const existing = await prisma.affectation.findFirst({
        where: { materielId, dateFin: null },
      })
      if (existing) {
        return { success: false, error: 'Ce matériel a déjà une affectation en cours.' }
      }
    }

    const aff = await prisma.$transaction(async (tx) => {
      const created = await tx.affectation.create({
        data: {
          materielId,
          utilisateurId,
          direction,
          entite,
          batiment,
          etage,
          bureau,
          commentaire,
          dateDebut,
          dateFin,
          etatRetour: etatRetour as any,
        },
      })

      if (!cloturee) {
        // Close current open état
        await tx.etatMateriel.updateMany({
          where: { materielId, dateFin: null },
          data:  { dateFin: dateDebut },
        })
        // Record new état
        await tx.etatMateriel.create({
          data: { materielId, etat: 'AFFECTE', dateDebut },
        })
        await tx.materiel.update({
          where: { id: materielId },
          data:  { statut: 'AFFECTE' },
        })
      }

      return created
    })

    revalidatePath('/affectations')
    revalidatePath('/materiels')
    return { success: true, id: aff.id }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la création.' }
  }
}

export async function closeAffectation(
  id: number,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const dateFinRaw = formData.get('dateFin') as string
    const etatRetour = (formData.get('etatRetour') as string) || null

    if (!dateFinRaw) return { success: false, error: 'La date de fin est obligatoire.' }
    const dateFin = new Date(dateFinRaw)

    const aff = await prisma.affectation.findUnique({ where: { id } })
    if (!aff) return { success: false, error: 'Affectation introuvable.' }
    if (aff.dateFin) return { success: false, error: 'Cette affectation est déjà clôturée.' }

    await prisma.$transaction(async (tx) => {
      await tx.affectation.update({
        where: { id },
        data:  { dateFin, etatRetour: etatRetour as any },
      })
      // Close current état
      await tx.etatMateriel.updateMany({
        where: { materielId: aff.materielId, dateFin: null },
        data:  { dateFin },
      })
      // Record return to DISPONIBLE
      await tx.etatMateriel.create({
        data: { materielId: aff.materielId, etat: 'DISPONIBLE', dateDebut: dateFin },
      })
      await tx.materiel.update({
        where: { id: aff.materielId },
        data:  { statut: 'DISPONIBLE' },
      })
    })

    revalidatePath('/affectations')
    revalidatePath('/materiels')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la clôture.' }
  }
}
