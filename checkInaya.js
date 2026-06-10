const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const inaya = await prisma.user.findFirst({ where: { name: { contains: "Inaya", mode: "insensitive" } } });
  console.log("Inaya:", inaya);
  
  if (inaya) {
    const votes = await prisma.vote.findMany({ where: { userId: inaya.id } });
    console.log("Inaya votes:", votes);
    
    // Check elections
    const elections = await prisma.election.findMany({
      include: {
        votes: { where: { userId: inaya.id } }
      }
    });
    console.log("Elections with Inaya votes:", elections.map(e => ({ title: e.title, votes: e.votes.length })));
  }
}
main().finally(() => prisma.$disconnect());
