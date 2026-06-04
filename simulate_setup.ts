import "dotenv/config"
import { prisma } from "./src/lib/prisma"
import bcrypt from "bcrypt"

async function main() {
  const nim = "221071001"
  const passwordHash = await bcrypt.hash(nim, 10)

  const user = await prisma.user.upsert({
    where: { nim },
    update: { passwordHash, isActive: true },
    create: {
      nim,
      name: "Mahasiswa Simulasi",
      passwordHash,
      role: "MAHASISWA",
      isActive: true,
      importSource: "manual"
    }
  })

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } })
  const createdBy = admin ? admin.id : user.id

  const startAt = new Date(Date.now() - 3600000); // 1 hour ago
  const endAt = new Date(Date.now() + 60000); // Ends in 60 seconds
  const id = 'dummy-election-1';

  await prisma.election.upsert({
    where: { id },
    update: { endAt, status: 'ACTIVE' },
    create: {
      id,
      title: 'Pemilihan Nama Angkatan (Simulasi)',
      description: 'Ini simulasi',
      type: 'NAMA_ANGKATAN',
      method: 'SINGLE_CHOICE',
      minChoices: 1,
      maxChoices: 1,
      startAt,
      endAt,
      status: 'ACTIVE',
      createdBy
    }
  })

  await prisma.electionOption.upsert({
    where: { id: 'dummy-opt-1' },
    update: {},
    create: { id: 'dummy-opt-1', electionId: id, name: 'Alpha', orderNumber: 1 }
  })
  
  await prisma.electionOption.upsert({
    where: { id: 'dummy-opt-2' },
    update: {},
    create: { id: 'dummy-opt-2', electionId: id, name: 'Beta', orderNumber: 2 }
  })

  console.log(`User ${nim} and Election ${id} created/updated. Election ends at ${endAt}`);
}

main().finally(() => prisma.$disconnect())
