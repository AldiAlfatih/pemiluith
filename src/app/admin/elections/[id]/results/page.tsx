import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Users, CheckCircle2, Vote } from "lucide-react"
import ResultsClient from "./results-client"

export default async function ElectionResultsPage({ params }: { params: { id: string } }) {
  const election = await prisma.election.findUnique({
    where: { id: params.id },
    include: {
      options: {
        orderBy: { orderNumber: "asc" }
      },
      candidates: {
        orderBy: { orderNumber: "asc" }
      },
      _count: {
        select: {
          votes: true
        }
      }
    }
  })

  if (!election) {
    notFound()
  }

  // Get total registered students
  const totalStudents = await prisma.user.count({
    where: { role: "MAHASISWA", isActive: true }
  })

  // Get participation percentage
  const participationRate = totalStudents > 0 
    ? Math.round((election._count.votes / totalStudents) * 100) 
    : 0

  // Get all votes to calculate results
  const votes = await prisma.vote.findMany({
    where: { electionId: params.id },
    include: {
      user: {
        select: { id: true, name: true, nim: true, className: true }
      },
      details: true
    },
    orderBy: { createdAt: "desc" }
  })

  // Prepare results data
  const resultsData: Record<string, number> = {}
  
  if (election.type === 'KETUA_ANGKATAN') {
    election.candidates.forEach(c => resultsData[c.id] = 0)
    votes.forEach(vote => {
      vote.details.forEach(detail => {
        if (detail.candidateId && resultsData[detail.candidateId] !== undefined) {
          resultsData[detail.candidateId]++
        }
      })
    })
  } else {
    election.options.forEach(o => resultsData[o.id] = 0)
    votes.forEach(vote => {
      vote.details.forEach(detail => {
        if (detail.optionId && resultsData[detail.optionId] !== undefined) {
          resultsData[detail.optionId]++
        }
      })
    })
  }

  // Serialize election to strip all Prisma Date fields — required for Client Component
  const serializedElection = {
    id: election.id,
    title: election.title,
    type: election.type,
    status: election.status,
    candidates: election.candidates.map(c => ({
      id: c.id,
      name: c.name,
      nim: c.nim,
      programStudy: c.programStudy,
      vision: c.vision ?? null,
      mission: c.mission ?? null,
      isActive: c.isActive,
      orderNumber: c.orderNumber,
    })),
    options: election.options.map(o => ({
      id: o.id,
      name: o.name,
      meaning: o.meaning ?? null,
      philosophy: o.philosophy ?? null,
      isActive: o.isActive,
      orderNumber: o.orderNumber,
    })),
  }

  // Serialize voter list — strip all Date objects before passing to Client Component
  const voters = votes.map(vote => ({
    id: vote.id,
    userId: vote.user.id,
    name: vote.user.name,
    nim: vote.user.nim,
    className: vote.user.className || "-",
    votedAt: vote.createdAt.toISOString(),
    details: vote.details.map(d => ({
      id: d.id,
      voteId: d.voteId,
      optionId: d.optionId ?? null,
      candidateId: d.candidateId ?? null,
    }))
  }))

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/elections" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-purple-100 text-purple-700 border border-purple-200">
              {election.type.replace("_", " ")}
            </span>
            <span className={`px-2 py-1 text-[10px] font-bold rounded-md border ${
              election.status === 'ACTIVE' ? "bg-green-100 text-green-700 border-green-200" :
              election.status === 'CLOSED' ? "bg-slate-100 text-slate-700 border-slate-200" :
              "bg-amber-100 text-amber-700 border-amber-200"
            }`}>
              {election.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{election.title}</h1>
          <p className="text-sm text-slate-500">Pantau progres perolehan suara dan partisipasi pemilih secara langsung.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Vote size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Suara Masuk</p>
            <p className="text-2xl font-black text-slate-800">{election._count.votes}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Mahasiswa</p>
            <p className="text-2xl font-black text-slate-800">{totalStudents}</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Tingkat Partisipasi</p>
            <p className="text-2xl font-black text-slate-800">{participationRate}%</p>
          </div>
        </div>
      </div>

      {/* Main Content Area via Client Component */}
      <ResultsClient 
        election={serializedElection} 
        resultsData={resultsData} 
        voters={voters}
        totalVotes={election._count.votes}
      />
    </div>
  )
}
