'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { canDo, getSessionRole } from '@/lib/permissions'

export async function updateMateriel(id: number, formData: FormData) {
  const role = await getSessionRole()
  if (!canDo(role, 'materiels', 'modifier')) redirect('/acces-interdit')

  const numeroSerie      = (formData.get('numeroSerie') as string)?.trim() || null
  const statut           = formData.get('statut') as string
  const dateFinGarantie  = (formData.get('dateFinGarantie') as string)?.trim()

  await prisma.materiel.update({
    where: { id },
    data: {
      numeroSerie,
      statut: statut as any,
      dateFinGarantie: dateFinGarantie ? new Date(dateFinGarantie) : null,
    },
  })
  revalidatePath('/materiels')
  redirect(`/materiels/${id}`)
}
