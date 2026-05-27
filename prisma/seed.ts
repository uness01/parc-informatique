import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('Admin@2024', 10)

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@energie.gov.ma' },
    update: {},
    create: {
      nom: 'Administrateur',
      prenom: 'Système',
      email: 'admin@energie.gov.ma',
      password: hash,
      role: 'ADMIN',
      actif: true,
    },
  })

  console.log('✅ Utilisateur admin créé :', admin.email)
  console.log('   Mot de passe : Admin@2024')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
