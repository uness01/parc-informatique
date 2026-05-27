export function formatDate(date: Date | string | null): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('fr-MA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return '—'
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export const STATUT_MATERIEL_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  AFFECTE: 'Affecté',
  EN_REPARATION: 'En réparation',
  REFORME: 'Réformé',
  PERDU: 'Perdu',
}

export const STATUT_MATERIEL_COLORS: Record<string, string> = {
  DISPONIBLE: 'bg-green-100 text-green-800',
  AFFECTE: 'bg-blue-100 text-blue-800',
  EN_REPARATION: 'bg-orange-100 text-orange-800',
  REFORME: 'bg-gray-100 text-gray-800',
  PERDU: 'bg-red-100 text-red-800',
}

export const STATUT_PANNE_LABELS: Record<string, string> = {
  OUVERTE: 'Ouverte',
  EN_COURS: 'En cours',
  RESOLUE: 'Résolue',
  FERMEE: 'Fermée',
}

export const STATUT_PANNE_COLORS: Record<string, string> = {
  OUVERTE: 'bg-red-100 text-red-800',
  EN_COURS: 'bg-orange-100 text-orange-800',
  RESOLUE: 'bg-green-100 text-green-800',
  FERMEE: 'bg-gray-100 text-gray-800',
}

export const PRIORITE_LABELS: Record<string, string> = {
  BASSE: 'Basse',
  MOYENNE: 'Moyenne',
  HAUTE: 'Haute',
  CRITIQUE: 'Critique',
}

export const PRIORITE_COLORS: Record<string, string> = {
  BASSE: 'bg-gray-100 text-gray-700',
  MOYENNE: 'bg-yellow-100 text-yellow-800',
  HAUTE: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800',
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrateur',
  GESTIONNAIRE: 'Gestionnaire',
  TECHNICIEN: 'Technicien',
  CONSULTANT: 'Consultant',
}

export const TYPE_ACQUISITION_LABELS: Record<string, string> = {
  MARCHE: 'Marché',
  BON_DE_COMMANDE: 'Bon de commande',
  DON: 'Don',
}

export const STATUT_REPARATION_LABELS: Record<string, string> = {
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  ANNULEE: 'Annulée',
}

export const STATUT_REPARATION_COLORS: Record<string, string> = {
  EN_COURS: 'bg-orange-100 text-orange-800',
  TERMINEE: 'bg-green-100 text-green-800',
  ANNULEE: 'bg-gray-100 text-gray-700',
}
