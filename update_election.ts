import "dotenv/config"
import { prisma } from "./src/lib/prisma"

async function main() {
  const election = await prisma.election.findFirst({
    where: { status: 'ACTIVE' }
  });
  
  if (election) {
    const endAt = new Date(Date.now() + 45000); // Ends in 45 seconds
    await prisma.election.update({
      where: { id: election.id },
      data: { endAt }
    });
    console.log(`Updated election ${election.title} to end at ${endAt}`);
  } else {
    console.log('No active election found');
  }
}
main();
