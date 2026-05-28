'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { canDo, getSessionRole } from '@/lib/permissions'

export async function deleteAcquisition(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const role = await getSessionRole()
  if (!canDo(role, 'acquisitions', 'supprimer')) {
    return { success: false, error: 'Permission refusée.' }
  }

  try {
    const lotsCount = await prisma.lot.count({ where: { acquisitionId: id } })
    if (lotsCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : cette acquisition contient ${lotsCount} lot(s). Supprimez-les d'abord.`,
      }
    }
    await prisma.acquisition.delete({ where: { id } })
    revalidatePath('/acquisitions')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la suppression.' }
  }
}
