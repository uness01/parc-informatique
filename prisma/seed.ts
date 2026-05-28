import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Nettoyer les données (ordre inverse des dépendances) ─────
  await prisma.reparation.deleteMany({})
  await prisma.panne.deleteMany({})
  await prisma.etatMateriel.deleteMany({})
  await prisma.affectation.deleteMany({})
  await prisma.materiel.deleteMany({})
  await prisma.livraison.deleteMany({})
  await prisma.caracteristique.deleteMany({})
  await prisma.article.deleteMany({})
  await prisma.lot.deleteMany({})
  await prisma.acquisition.deleteMany({})
  await prisma.societe.deleteMany({})

  // ─── Utilisateurs (1 par rôle) ────────────────────────────────
  const [passAdmin, passGest, passTech, passConsult] = await Promise.all([
    bcrypt.hash('Admin@2024', 10),
    bcrypt.hash('Gest@2024', 10),
    bcrypt.hash('Tech@2024', 10),
    bcrypt.hash('Consult@2024', 10),
  ])

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@energie.gov.ma' },
    update: { password: passAdmin, role: 'ADMIN', actif: true },
    create: { nom: 'Administrateur', prenom: 'Système', email: 'admin@energie.gov.ma', password: passAdmin, role: 'ADMIN', actif: true },
  })
  const gestionnaire = await prisma.utilisateur.upsert({
    where: { email: 'gestionnaire@energie.gov.ma' },
    update: { password: passGest, role: 'GESTIONNAIRE', actif: true },
    create: { nom: 'Benali', prenom: 'Karim', email: 'gestionnaire@energie.gov.ma', password: passGest, role: 'GESTIONNAIRE', actif: true },
  })
  const technicien = await prisma.utilisateur.upsert({
    where: { email: 'technicien@energie.gov.ma' },
    update: { password: passTech, role: 'TECHNICIEN', actif: true },
    create: { nom: 'Tahiri', prenom: 'Youssef', email: 'technicien@energie.gov.ma', password: passTech, role: 'TECHNICIEN', actif: true },
  })
  const consultant = await prisma.utilisateur.upsert({
    where: { email: 'consultant@energie.gov.ma' },
    update: { password: passConsult, role: 'CONSULTANT', actif: true },
    create: { nom: 'Idrissi', prenom: 'Sara', email: 'consultant@energie.gov.ma', password: passConsult, role: 'CONSULTANT', actif: true },
  })

  // ─── Sociétés ─────────────────────────────────────────────────
  const [soc1, soc2] = await Promise.all([
    prisma.societe.create({ data: { nom: 'TechInformatique Maroc', telephone: '0522-123456', email: 'contact@ti-maroc.ma', adresse: '12 Rue Hassan II, Casablanca' } }),
    prisma.societe.create({ data: { nom: 'InfoSystems SARL', telephone: '0537-654321', email: 'contact@infosystems.ma', adresse: '7 Avenue Mohammed V, Rabat' } }),
  ])

  // ─── Acquisitions ─────────────────────────────────────────────
  const [acq1, acq2] = await Promise.all([
    prisma.acquisition.create({ data: { type: 'MARCHE', code: 'ACQ-2024-001', date: new Date('2024-01-15'), montant: 500000, nombreLots: 2 } }),
    prisma.acquisition.create({ data: { type: 'BON_DE_COMMANDE', code: 'ACQ-2024-002', date: new Date('2024-06-01'), montant: 120000, nombreLots: 1 } }),
  ])

  // ─── Lots ─────────────────────────────────────────────────────
  const [lot1, lot2, lot3] = await Promise.all([
    prisma.lot.create({ data: { numero: 'LOT-01', nom: 'Ordinateurs portables', montant: 300000, nombreArticles: 1, acquisitionId: acq1.id, societeId: soc1.id } }),
    prisma.lot.create({ data: { numero: 'LOT-02', nom: 'Imprimantes et scanners',  montant: 200000, nombreArticles: 2, acquisitionId: acq1.id, societeId: soc2.id } }),
    prisma.lot.create({ data: { numero: 'LOT-03', nom: 'Accessoires informatiques', montant: 120000, nombreArticles: 2, acquisitionId: acq2.id, societeId: soc1.id } }),
  ])

  // ─── Articles ─────────────────────────────────────────────────
  const [art1, art2, art3, art4, art5] = await Promise.all([
    prisma.article.create({ data: { numero: 'ART-001', designation: 'Ordinateur portable', marque: 'HP', modele: 'ProBook 450 G9', nombreMateriel: 3, prixUnitaire: 25000, dateFinGarantie: new Date('2027-01-15'), lotId: lot1.id } }),
    prisma.article.create({ data: { numero: 'ART-002', designation: 'Imprimante laser',    marque: 'HP', modele: 'LaserJet Pro M404d', nombreMateriel: 2, prixUnitaire: 8000, dateFinGarantie: new Date('2026-02-15'), lotId: lot2.id } }),
    prisma.article.create({ data: { numero: 'ART-003', designation: 'Scanner de bureau',   marque: 'HP', modele: 'ScanJet Pro 2500',   nombreMateriel: 1, prixUnitaire: 5000, dateFinGarantie: new Date('2026-02-15'), lotId: lot2.id } }),
    prisma.article.create({ data: { numero: 'ART-004', designation: 'Clé USB 64 Go',       marque: 'Kingston', modele: 'DataTraveler 100G3', nombreMateriel: 3, prixUnitaire: 150, lotId: lot3.id } }),
    prisma.article.create({ data: { numero: 'ART-005', designation: 'Souris sans fil',     marque: 'Logitech', modele: 'MX Master 3',         nombreMateriel: 2, prixUnitaire: 800, lotId: lot3.id } }),
  ])

  // ─── Caractéristiques ─────────────────────────────────────────
  await prisma.caracteristique.createMany({
    data: [
      { articleId: art1.id, nom: 'Processeur',         valeur: 'Intel Core i5-1235U' },
      { articleId: art1.id, nom: 'RAM',                valeur: '16 Go DDR4' },
      { articleId: art1.id, nom: 'Stockage',           valeur: 'SSD 512 Go NVMe' },
      { articleId: art1.id, nom: 'Écran',              valeur: '15.6" Full HD IPS' },
      { articleId: art2.id, nom: 'Vitesse impression', valeur: '38 ppm' },
      { articleId: art2.id, nom: 'Résolution',         valeur: '1200 x 1200 dpi' },
      { articleId: art3.id, nom: 'Résolution scan',    valeur: '1200 ppp optique' },
      { articleId: art3.id, nom: 'Chargeur ADF',       valeur: '50 feuilles' },
      { articleId: art5.id, nom: 'Connectivité',       valeur: 'Bluetooth 5.0 + USB' },
      { articleId: art5.id, nom: 'DPI',                valeur: '200–8000 réglable' },
    ],
  })

  // ─── Livraisons ───────────────────────────────────────────────
  const [liv1, liv2, liv3] = await Promise.all([
    prisma.livraison.create({ data: { numeroBL: 'BL-2024-001', dateLivraison: new Date('2024-02-01'), articleLivre: true,  lotId: lot1.id } }),
    prisma.livraison.create({ data: { numeroBL: 'BL-2024-002', dateLivraison: new Date('2024-02-15'), articleLivre: true,  lotId: lot2.id } }),
    prisma.livraison.create({ data: { numeroBL: 'BL-2024-003', dateLivraison: new Date('2024-07-01'), articleLivre: true,  lotId: lot3.id } }),
  ])

  // ─── Matériels ────────────────────────────────────────────────
  const [mat1, mat2, mat3, mat4, mat5, mat6, mat7, mat8, mat9, mat10, mat11] =
    await Promise.all([
      // HP ProBook ×3
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0001', numeroSerie: 'SN-HP001', statut: 'AFFECTE',       dateFinGarantie: new Date('2027-01-15'), articleId: art1.id, livraisonId: liv1.id } }),
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0002', numeroSerie: 'SN-HP002', statut: 'EN_REPARATION', dateFinGarantie: new Date('2027-01-15'), articleId: art1.id, livraisonId: liv1.id } }),
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0003', numeroSerie: 'SN-HP003', statut: 'DISPONIBLE',    dateFinGarantie: new Date('2027-01-15'), articleId: art1.id, livraisonId: liv1.id } }),
      // HP LaserJet ×2
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0004', numeroSerie: 'SN-HP004', statut: 'AFFECTE',    dateFinGarantie: new Date('2026-02-15'), articleId: art2.id, livraisonId: liv2.id } }),
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0005', numeroSerie: 'SN-HP005', statut: 'DISPONIBLE', dateFinGarantie: new Date('2026-02-15'), articleId: art2.id, livraisonId: liv2.id } }),
      // HP ScanJet ×1
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0006', numeroSerie: 'SN-HP006', statut: 'DISPONIBLE', dateFinGarantie: new Date('2026-02-15'), articleId: art3.id, livraisonId: liv2.id } }),
      // Kingston USB ×3
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0007', statut: 'DISPONIBLE', articleId: art4.id, livraisonId: liv3.id } }),
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0008', statut: 'DISPONIBLE', articleId: art4.id, livraisonId: liv3.id } }),
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0009', statut: 'DISPONIBLE', articleId: art4.id, livraisonId: liv3.id } }),
      // Logitech Mouse ×2
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0010', numeroSerie: 'SN-LG001', statut: 'AFFECTE',    articleId: art5.id, livraisonId: liv3.id } }),
      prisma.materiel.create({ data: { numeroInventaire: 'INV-2024-0011', numeroSerie: 'SN-LG002', statut: 'DISPONIBLE', articleId: art5.id, livraisonId: liv3.id } }),
    ])

  // ─── États matériels ──────────────────────────────────────────
  await prisma.etatMateriel.createMany({
    data: [
      { materielId: mat1.id, etat: 'AFFECTE',       dateDebut: new Date('2024-02-10') },
      { materielId: mat2.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-02-01'), dateFin: new Date('2024-11-01') },
      { materielId: mat2.id, etat: 'EN_REPARATION', dateDebut: new Date('2024-11-05') },
      { materielId: mat3.id, etat: 'AFFECTE',       dateDebut: new Date('2024-02-01'), dateFin: new Date('2024-06-30'), commentaire: 'Retourné en bon état' },
      { materielId: mat3.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-06-30') },
      { materielId: mat4.id, etat: 'AFFECTE',       dateDebut: new Date('2024-03-01') },
      { materielId: mat5.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-02-15') },
      { materielId: mat6.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-02-15') },
      { materielId: mat7.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-07-01') },
      { materielId: mat8.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-07-01') },
      { materielId: mat9.id, etat: 'DISPONIBLE',    dateDebut: new Date('2024-07-01') },
      { materielId: mat10.id, etat: 'AFFECTE',      dateDebut: new Date('2024-07-15') },
      { materielId: mat11.id, etat: 'DISPONIBLE',   dateDebut: new Date('2024-07-01') },
    ],
  })

  // ─── Affectations ─────────────────────────────────────────────
  await prisma.affectation.createMany({
    data: [
      // En cours
      { materielId: mat1.id,  utilisateurId: gestionnaire.id, dateDebut: new Date('2024-02-10'), direction: "Direction des Systèmes d'Information", entite: 'Service Informatique', batiment: 'Bâtiment A', etage: '2', bureau: '215' },
      { materielId: mat4.id,  utilisateurId: technicien.id,   dateDebut: new Date('2024-03-01'), direction: 'Direction Technique',                  entite: 'Service Maintenance',  batiment: 'Bâtiment B', etage: '1', bureau: '105' },
      { materielId: mat10.id, utilisateurId: consultant.id,   dateDebut: new Date('2024-07-15'), direction: 'Direction Finance',                     entite: 'Service Comptabilité', batiment: 'Bâtiment C', etage: '3', bureau: '320' },
      // Clôturée
      { materielId: mat3.id,  utilisateurId: admin.id, dateDebut: new Date('2024-02-01'), dateFin: new Date('2024-06-30'), direction: 'Direction des Ressources Humaines', entite: 'Service Recrutement', etatRetour: 'BON', commentaire: 'Retour en bon état, appareil en parfait état de fonctionnement.' },
    ],
  })

  // ─── Pannes ───────────────────────────────────────────────────
  const [panne1, panne2, panne3] = await Promise.all([
    prisma.panne.create({ data: { description: "Écran noir au démarrage — le laptop ne s'allume plus correctement", priorite: 'HAUTE',   date: new Date('2024-11-01'), statut: 'EN_COURS', materielId: mat2.id, utilisateurId: admin.id } }),
    prisma.panne.create({ data: { description: "Bourrage papier fréquent dans le bac d'alimentation principal",    priorite: 'MOYENNE', date: new Date('2024-10-15'), statut: 'RESOLUE',  materielId: mat5.id, utilisateurId: gestionnaire.id } }),
    prisma.panne.create({ data: { description: 'Scanner ne reconnaît pas les documents couleur, rendu en N&B uniquement', priorite: 'BASSE', date: new Date('2024-12-01'), statut: 'OUVERTE', materielId: mat6.id, utilisateurId: technicien.id } }),
  ])

  // ─── Réparations ──────────────────────────────────────────────
  await prisma.reparation.createMany({
    data: [
      {
        codeBon: 'BON-2024-001', typeMaintenance: 'CORRECTIVE',
        dateDebut: new Date('2024-11-05'), statut: 'EN_COURS',
        panneId: panne1.id, technicienId: technicien.id, societeId: soc1.id,
        rapport: "Diagnostic en cours : problème identifié au niveau du connecteur d'alimentation de l'écran.",
      },
      {
        codeBon: 'BON-2024-002', typeMaintenance: 'CORRECTIVE',
        dateDebut: new Date('2024-10-20'), dateFin: new Date('2024-11-10'), statut: 'TERMINEE', cout: 1500,
        panneId: panne2.id, technicienId: technicien.id, societeId: soc2.id,
        rapport: "Remplacement du rouleau d'entraînement papier. Imprimante testée et opérationnelle.",
      },
    ],
  })

  // ─── Résumé ───────────────────────────────────────────────────
  console.log('\n✅ Base de données alimentée avec succès !\n')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  COMPTES DE TEST')
  console.log('═══════════════════════════════════════════════════════════════')
  console.log('  Rôle           Email                           Mot de passe')
  console.log('  ─────────────────────────────────────────────────────────────')
  console.log('  ADMIN          admin@energie.gov.ma            Admin@2024')
  console.log('  GESTIONNAIRE   gestionnaire@energie.gov.ma     Gest@2024')
  console.log('  TECHNICIEN     technicien@energie.gov.ma       Tech@2024')
  console.log('  CONSULTANT     consultant@energie.gov.ma       Consult@2024')
  console.log('═══════════════════════════════════════════════════════════════\n')
  console.log('  Données créées :')
  console.log('  • 4 utilisateurs (1 par rôle)')
  console.log('  • 2 sociétés, 2 acquisitions, 3 lots, 5 articles')
  console.log('  • 10 caractéristiques, 3 livraisons, 11 matériels')
  console.log('  • 4 affectations (3 en cours, 1 clôturée BON état)')
  console.log('  • 3 pannes (1 ouverte, 1 en cours, 1 résolue)')
  console.log('  • 2 réparations (1 en cours, 1 terminée)\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
