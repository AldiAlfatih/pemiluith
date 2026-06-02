import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')
  
  // 1. Create Admin
  const adminPassword = await bcrypt.hash('KyaSup773', 10)
  const admin = await prisma.user.upsert({
    where: { nim: 'admin' },
    update: { passwordHash: adminPassword },
    create: {
      nim: 'admin',
      name: 'Administrator',
      passwordHash: adminPassword,
      role: 'ADMIN',
      mustChangePassword: false,
    },
  })
  console.log(`Created admin: ${admin.nim}`)

  // 2. Create Dummy Students
  for (let i = 1; i <= 10; i++) {
    const nim = `202400${i.toString().padStart(2, '0')}`
    const studentPassword = await bcrypt.hash(nim, 10)
    
    await prisma.user.upsert({
      where: { nim },
      update: {},
      create: {
        nim,
        name: `Mahasiswa ${i}`,
        passwordHash: studentPassword,
        role: 'MAHASISWA',
        programStudy: 'Informatika',
        className: 'Angkatan 1',
        mustChangePassword: true, // as required
      },
    })
    console.log(`Created student: ${nim}`)
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
