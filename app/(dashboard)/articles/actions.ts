'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { canDo, getSessionRole } from '@/lib/permissions'

export async function createArticle(formData: FormData) {
  const role = await getSessionRole()
  if (!canDo(role, 'articles', 'ajouter')) redirect('/acces-interdit')

  const numero         = (formData.get('numero') as string).trim()
  const designation    = (formData.get('designation') as string).trim()
  const marque         = (formData.get('marque') as string).trim()
  const modele         = (formData.get('modele') as string).trim()
  const lotId          = parseInt(formData.get('lotId') as string)
  const nombreMateriel = parseInt(formData.get('nombreMateriel') as string)
  const prixUnitaire   = parseFloat(formData.get('prixUnitaire') as string)
  const dateRaw        = (formData.get('dateFinGarantie') as string).trim()
  const dateFinGarantie = dateRaw ? new Date(dateRaw) : null

  await prisma.article.create({
    data: { numero, designation, marque, modele, lotId, nombreMateriel, prixUnitaire, dateFinGarantie },
  })
  redirect('/articles')
}

export async function deleteArticle(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const role = await getSessionRole()
  if (!canDo(role, 'articles', 'supprimer')) {
    return { success: false, error: 'Permission refusée.' }
  }

  try {
    const materielsCount = await prisma.materiel.count({ where: { articleId: id } })
    if (materielsCount > 0) {
      return {
        success: false,
        error: `Impossible de supprimer : cet article est lié à ${materielsCount} matériel(s). Supprimez-les d'abord.`,
      }
    }
    await prisma.caracteristique.deleteMany({ where: { articleId: id } })
    await prisma.article.delete({ where: { id } })
    revalidatePath('/articles')
    return { success: true }
  } catch {
    return { success: false, error: 'Une erreur est survenue lors de la suppression.' }
  }
}

export async function addCaracteristique(
  articleId: number,
  nom: string,
  valeur: string
): Promise<{ success: boolean; data?: { id: number; nom: string; valeur: string }; error?: string }> {
  const role = await getSessionRole()
  if (!canDo(role, 'articles', 'modifier')) {
    return { success: false, error: 'Permission refusée.' }
  }

  try {
    const c = await prisma.caracteristique.create({
      data: { articleId, nom: nom.trim(), valeur: valeur.trim() },
    })
    return { success: true, data: { id: c.id, nom: c.nom, valeur: c.valeur } }
  } catch {
    return { success: false, error: "Erreur lors de l'ajout de la caractéristique." }
  }
}

export async function updateCaracteristique(
  id: number,
  nom: string,
  valeur: string
): Promise<{ success: boolean; error?: string }> {
  const role = await getSessionRole()
  if (!canDo(role, 'articles', 'modifier')) {
    return { success: false, error: 'Permission refusée.' }
  }

  try {
    await prisma.caracteristique.update({
      where: { id },
      data: { nom: nom.trim(), valeur: valeur.trim() },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la mise à jour.' }
  }
}

export async function deleteCaracteristique(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const role = await getSessionRole()
  if (!canDo(role, 'articles', 'modifier')) {
    return { success: false, error: 'Permission refusée.' }
  }

  try {
    await prisma.caracteristique.delete({ where: { id } })
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la suppression.' }
  }
}
