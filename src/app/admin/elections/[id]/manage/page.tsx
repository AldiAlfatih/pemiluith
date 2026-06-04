import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, Settings2 } from "lucide-react"
import ManageCandidatesClient from "./ManageCandidatesClient"
import ManageOptionsClient from "./ManageOptionsClient"
import BlastNotificationButton from "./BlastNotificationButton"

export default async function ManageElectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: { orderBy: { orderNumber: "asc" } },
      options: { orderBy: { orderNumber: "asc" } }
    }
  })

  if (!election) {
    notFound()
  }

  // Identify whether this election uses Candidates (Ketua) or Options (Nama Angkatan, Logo, dll)
  const isCandidateType = election.type === "KETUA_ANGKATAN"

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/elections" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Voting: {election.title}</h1>
          <p className="text-sm text-slate-500">Tipe: {election.type.replace("_", " ")} | Status: {election.status}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            {isCandidateType ? <Users size={24} /> : <Settings2 size={24} />}
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {isCandidateType ? "Daftar Kandidat" : "Daftar Opsi / Pilihan"}
          </h2>
        </div>

        {isCandidateType ? (
          <ManageCandidatesClient electionId={election.id} candidates={election.candidates} />
        ) : (
          <ManageOptionsClient electionId={election.id} options={election.options} />
        )}
      </div>

      {election.status === "ACTIVE" && (
        <BlastNotificationButton electionId={election.id} />
      )}
    </div>
  )
}
