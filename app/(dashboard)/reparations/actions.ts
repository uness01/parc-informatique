'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createReparation(
  formData: FormData
): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const panneId      = parseInt(formData.get('panneId') as string)
    const technicienId = parseInt(formData.get('technicienId') as string)
    const societeId    = parseInt(formData.get('societeId') as string)
    const codeBon      = (formData.get('codeBon') as string).trim()
    const typeMaint    = formData.get('typeMaintenance') as string
    const statut       = (formData.get('statut') as string) || 'EN_COURS'
    const dateDebutRaw = formData.get('dateDebut') as string
    const dateFinRaw   = formData.get('dateFin') as string
    const coutRaw      = formData.get('cout') as string
    const rapport      = (formData.get('rapport') as string).trim() || null

    if (isNaN(panneId) || isNaN(technicienId) || isNaN(societeId)) {
      return { success: false, error: 'Panne, technicien et société sont obligatoires.' }
    }
    if (!codeBon) {
      return { success: false, error: 'Le code bon est obligatoire.' }
    }
    if (!dateDebutRaw) {
      return { success: false, error: 'La date de début est obligatoire.' }
    }

    const dateDebut = new Date(dateDebutRaw)
    const dateFin   = dateFinRaw ? new Date(dateFinRaw) : null
    const cout      = coutRaw ? parseFloat(coutRaw) : null

    const reparation = await prisma.$transaction(async (tx) => {
      const r = await tx.reparation.create({
        data: {
          codeBon, typeMaintenance: typeMaint as any,
          dateDebut, dateFin, cout, rapport,
          statut: statut as any, panneId, technicienId, societeId,
        },
      })

      // Move panne to EN_COURS if still OUVERTE
      const panne = await tx.panne.findUnique({
        where: { id: panneId },
        select: { statut: true, materielId: true },
      })
      if (panne && panne.statut === 'OUVERTE') {
        await tx.panne.update({ where: { id: panneId }, data: { statut: 'EN_COURS' } })
      }

      // If created as TERMINEE, resolve panne & restore materiel
      if (statut === 'TERMINEE' && panne) {
        await tx.panne.update({ where: { id: panneId }, data: { statut: 'RESOLUE' } })
        const resolved = dateFin ?? dateDebut
        await tx.etatMateriel.updateMany({
          where: { materielId: panne.materielId, dateFin: null },
          data:  { dateFin: resolved },
        })
        await tx.etatMateriel.create({
          data: { materielId: panne.materielId, etat: 'DISPONIBLE', dateDebut: resolved },
        })
        await tx.materiel.update({
          where: { id: panne.materielId },
          data:  { statut: 'DISPONIBLE' },
        })
      }

      return r
    })

    revalidatePath('/reparations')
    revalidatePath('/pannes')
    revalidatePath('/materiels')
    return { success: true, id: reparation.id }
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return { success: false, error: 'Ce code bon existe déjà.' }
    }
    return { success: false, error: 'Une erreur est survenue lors de la création.' }
  }
}

export async function updateReparationStatut(
  id: number,
  statut: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const r = await tx.reparation.findUnique({
        where: { id },
        select: { panneId: true, dateFin: true, dateDebut: true },
      })
      if (!r) throw new Error('not found')

      await tx.reparation.update({ where: { id }, data: { statut: statut as any } })

      if (statut === 'TERMINEE') {
        const panne = await tx.panne.findUnique({
          where: { id: r.panneId },
          select: { materielId: true },
        })
        await tx.panne.update({ where: { id: r.panneId }, data: { statut: 'RESOLUE' } })
        if (panne) {
          const resolved = r.dateFin ?? new Date()
          await tx.etatMateriel.updateMany({
            where: { materielId: panne.materielId, dateFin: null },
            data:  { dateFin: resolved },
          })
          await tx.etatMateriel.create({
            data: { materielId: panne.materielId, etat: 'DISPONIBLE', dateDebut: resolved },
          })
          await tx.materiel.update({
            where: { id: panne.materielId },
            data:  { statut: 'DISPONIBLE' },
          })
        }
      }
    })

    revalidatePath('/reparations')
    revalidatePath('/pannes')
    revalidatePath('/materiels')
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors du changement de statut.' }
  }
}

export async function deleteReparation(
  id: number
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.reparation.delete({ where: { id } })
    revalidatePath('/reparations')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la suppression.' }
  }
}
