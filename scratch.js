const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.candidate.findMany({ select: { name: true, photoUrl: true } })
  .then(console.log)
  .finally(() => prisma.$disconnect());
