import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import VotingClientForm from "./VotingClientForm"
import CountdownTimer from "@/components/CountdownTimer"

export default async function VotingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  if (!session || session.user.role !== "MAHASISWA") {
    redirect("/login")
  }

  const userId = session.user.id

  // Fetch election with its items
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: { orderBy: { orderNumber: "asc" } },
      options: { orderBy: { orderNumber: "asc" } }
    }
  })

  if (!election) notFound()

  // Verify status and time
  const now = new Date()
  const hasNoDates = !election.startAt || !election.endAt
  const isUpcoming = election.startAt ? now < (election.startAt as Date) : false
  const isClosed = (!hasNoDates && now > (election.endAt as Date)) || election.status === "CLOSED"
  const isActive = (!hasNoDates && !isUpcoming && !isClosed && election.status === "ACTIVE") || (election.status === "ACTIVE" && !hasNoDates && !isUpcoming && !isClosed)

  if (!isActive) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white border border-gray-200 rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Akses Tertutup</h2>
        <p className="text-gray-500 mb-6">Pemilihan ini sedang tidak aktif, belum dimulai, atau telah berakhir.</p>
        <Link href="/dashboard" className="text-[#2563EB] font-medium hover:underline">Kembali ke Dasbor</Link>
      </div>
    )
  }

  // Check if user has already voted
  const existingVote = await prisma.vote.findUnique({
    where: {
      electionId_userId: { electionId: id, userId }
    }
  })

  if (existingVote) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-50 border border-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Suara Telah Diterima</h2>
        <p className="text-gray-500 mb-6">Anda sudah memberikan suara pada kegiatan pemilihan ini. Terima kasih atas partisipasi Anda!</p>
        <Link href="/dashboard" className="inline-block bg-[#111827] hover:bg-[#1F2937] text-white font-medium py-2 px-6 rounded-lg transition-colors">
          Kembali ke Dasbor
        </Link>
      </div>
    )
  }

  const isCandidateType = election.type === "KETUA_ANGKATAN"
  const items = isCandidateType ? election.candidates : election.options

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-x-1 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{election.title}</h1>
          {election.endAt && <CountdownTimer targetDate={election.endAt} />}
        </div>
        {election.description && election.description.replace(/\n?<!--\[HIDE_VOTES\]-->/g, "").trim() !== "" && (
          <p className="text-gray-600 mt-3 text-lg leading-relaxed max-w-3xl">{election.description.replace(/\n?<!--\[HIDE_VOTES\]-->/g, "").trim()}</p>
        )}
      </div>

      <VotingClientForm election={election} items={items as any} />
    </div>
  )
}
