-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GESTIONNAIRE', 'TECHNICIEN', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "TypeAcquisition" AS ENUM ('MARCHE', 'BON_DE_COMMANDE', 'DON');

-- CreateEnum
CREATE TYPE "StatutMateriel" AS ENUM ('DISPONIBLE', 'AFFECTE', 'EN_REPARATION', 'REFORME', 'PERDU');

-- CreateEnum
CREATE TYPE "EtatRetour" AS ENUM ('BON', 'MAUVAIS', 'MOYEN');

-- CreateEnum
CREATE TYPE "EtatType" AS ENUM ('DISPONIBLE', 'AFFECTE', 'EN_REPARATION', 'REFORME', 'PERDU');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "StatutPanne" AS ENUM ('OUVERTE', 'EN_COURS', 'RESOLUE', 'FERMEE');

-- CreateEnum
CREATE TYPE "TypeMaintenance" AS ENUM ('CORRECTIVE', 'PREVENTIVE');

-- CreateEnum
CREATE TYPE "StatutReparation" AS ENUM ('EN_COURS', 'TERMINEE', 'ANNULEE');

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONSULTANT',
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acquisition" (
    "id" SERIAL NOT NULL,
    "type" "TypeAcquisition" NOT NULL,
    "code" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "nombreLots" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Acquisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Societe" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Societe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "nombreArticles" INTEGER NOT NULL,
    "acquisitionId" INTEGER NOT NULL,
    "societeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "nombreMateriel" INTEGER NOT NULL,
    "prixUnitaire" DOUBLE PRECISION NOT NULL,
    "dateFinGarantie" TIMESTAMP(3),
    "lotId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Caracteristique" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "articleId" INTEGER NOT NULL,

    CONSTRAINT "Caracteristique_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Livraison" (
    "id" SERIAL NOT NULL,
    "numeroBL" TEXT NOT NULL,
    "dateLivraison" TIMESTAMP(3) NOT NULL,
    "lotId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Livraison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Materiel" (
    "id" SERIAL NOT NULL,
    "numeroInventaire" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "statut" "StatutMateriel" NOT NULL DEFAULT 'DISPONIBLE',
    "dateFinGarantie" TIMESTAMP(3),
    "articleId" INTEGER NOT NULL,
    "livraisonId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Materiel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affectation" (
    "id" SERIAL NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "direction" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "batiment" TEXT,
    "etage" TEXT,
    "bureau" TEXT,
    "commentaire" TEXT,
    "etatRetour" "EtatRetour",
    "materielId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Affectation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EtatMateriel" (
    "id" SERIAL NOT NULL,
    "etat" "EtatType" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "commentaire" TEXT,
    "materielId" INTEGER NOT NULL,

    CONSTRAINT "EtatMateriel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panne" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "priorite" "Priorite" NOT NULL DEFAULT 'MOYENNE',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "statut" "StatutPanne" NOT NULL DEFAULT 'OUVERTE',
    "materielId" INTEGER NOT NULL,
    "utilisateurId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Panne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reparation" (
    "id" SERIAL NOT NULL,
    "codeBon" TEXT NOT NULL,
    "typeMaintenance" "TypeMaintenance" NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "cout" DOUBLE PRECISION,
    "rapport" TEXT,
    "statut" "StatutReparation" NOT NULL DEFAULT 'EN_COURS',
    "panneId" INTEGER NOT NULL,
    "technicienId" INTEGER NOT NULL,
    "societeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reparation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Acquisition_code_key" ON "Acquisition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Materiel_numeroInventaire_key" ON "Materiel"("numeroInventaire");

-- CreateIndex
CREATE UNIQUE INDEX "Materiel_numeroSerie_key" ON "Materiel"("numeroSerie");

-- CreateIndex
CREATE UNIQUE INDEX "Reparation_codeBon_key" ON "Reparation"("codeBon");

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_acquisitionId_fkey" FOREIGN KEY ("acquisitionId") REFERENCES "Acquisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Caracteristique" ADD CONSTRAINT "Caracteristique_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Livraison" ADD CONSTRAINT "Livraison_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materiel" ADD CONSTRAINT "Materiel_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materiel" ADD CONSTRAINT "Materiel_livraisonId_fkey" FOREIGN KEY ("livraisonId") REFERENCES "Livraison"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_materielId_fkey" FOREIGN KEY ("materielId") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Affectation" ADD CONSTRAINT "Affectation_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EtatMateriel" ADD CONSTRAINT "EtatMateriel_materielId_fkey" FOREIGN KEY ("materielId") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_materielId_fkey" FOREIGN KEY ("materielId") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panne" ADD CONSTRAINT "Panne_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparation" ADD CONSTRAINT "Reparation_panneId_fkey" FOREIGN KEY ("panneId") REFERENCES "Panne"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparation" ADD CONSTRAINT "Reparation_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparation" ADD CONSTRAINT "Reparation_societeId_fkey" FOREIGN KEY ("societeId") REFERENCES "Societe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
