import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

const MATRIX = {
  acquisitions: { consulter: ['ADMIN','GESTIONNAIRE','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  lots:         { consulter: ['ADMIN','GESTIONNAIRE','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  articles:     { consulter: ['ADMIN','GESTIONNAIRE','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  livraisons:   { consulter: ['ADMIN','GESTIONNAIRE','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  materiels:    { consulter: ['ADMIN','GESTIONNAIRE','TECHNICIEN','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  affectations: { consulter: ['ADMIN','GESTIONNAIRE','TECHNICIEN','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  pannes:       { consulter: ['ADMIN','GESTIONNAIRE','TECHNICIEN','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE','TECHNICIEN'], modifier: ['ADMIN','GESTIONNAIRE','TECHNICIEN'], supprimer: ['ADMIN'] },
  reparations:  { consulter: ['ADMIN','GESTIONNAIRE','TECHNICIEN','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE','TECHNICIEN'], modifier: ['ADMIN','GESTIONNAIRE','TECHNICIEN'], supprimer: ['ADMIN'] },
  societes:     { consulter: ['ADMIN','GESTIONNAIRE','CONSULTANT'], ajouter: ['ADMIN','GESTIONNAIRE'], modifier: ['ADMIN','GESTIONNAIRE'], supprimer: ['ADMIN'] },
  utilisateurs: { consulter: ['ADMIN'], ajouter: ['ADMIN'], modifier: ['ADMIN'], supprimer: ['ADMIN'] },
}

export function canDo(role: string, module: string, action: string): boolean {
  const m = (MATRIX as Record<string, Record<string, string[]>>)[module]
  return m?.[action]?.includes(role) ?? false
}

export async function getSessionRole(): Promise<string> {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.role ?? 'CONSULTANT'
}
