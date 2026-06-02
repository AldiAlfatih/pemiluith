import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditElectionClientForm from "./EditElectionClientForm"

export default async function EditElectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const election = await prisma.election.findUnique({
    where: { id }
  })

  if (!election) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <EditElectionClientForm election={election} />
    </div>
  )
}
