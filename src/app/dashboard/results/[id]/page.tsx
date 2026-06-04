import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import RecentVotersTicker from "./RecentVotersTicker"

export default async function LiveResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  
  if (!session) {
    redirect("/login")
  }

  // Fetch election with its items and vote counts
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: { 
        include: { _count: { select: { voteDetails: true } } },
        orderBy: { orderNumber: "asc" }
      },
      options: { 
        include: { _count: { select: { voteDetails: true } } },
        orderBy: { orderNumber: "asc" }
      },
      _count: { select: { votes: true } },
      votes: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          user: {
            select: { name: true, nim: true, programStudy: true }
          }
        }
      }
    }
  })

  if (!election) notFound()

  // Verify access rules
  const now = new Date()
  const isClosed = now > election.endAt || election.status === "CLOSED"

  const isCandidateType = election.type === "KETUA_ANGKATAN"
  const rawItems = isCandidateType ? election.candidates : election.options
  const totalVoters = election._count.votes

  // Sort items by vote count descending
  const sortedItems = [...rawItems].sort((a, b) => b._count.voteDetails - a._count.voteDetails)

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href={session.user.role === "ADMIN" ? "/admin/elections" : "/dashboard"} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <div className="flex justify-end items-start mb-6">
          <span className={`px-3 py-1 text-xs font-bold rounded-md tracking-wide ${isClosed ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
            {isClosed ? "HASIL AKHIR" : "LIVE RESULTS"}
          </span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{election.title}</h1>
        <div className="flex items-center gap-4 mt-4 text-sm font-medium text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {totalVoters} Pemilih Masuk
          </span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{election.method === "MULTIPLE_CHOICE" ? "Multiple Choice" : "Single Choice"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Perolehan Suara</h3>
          
          {sortedItems.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data kandidat/opsi.</p>
          ) : (
            <div className="space-y-6">
              {sortedItems.map((item, index) => {
                const votes = item._count.voteDetails
                // If totalVoters is 0, percentage is 0. Note: in multiple choice, percentage of voters might exceed 100% combined, which is mathematically correct (e.g. 100 voters, 80 chose A, 60 chose B). We calculate percentage based on totalVoters.
                const percentage = totalVoters > 0 ? Math.round((votes / totalVoters) * 100) : 0
                const isWinner = index === 0 && votes > 0
                
                return (
                  <div key={item.id} className="relative">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isWinner ? "bg-[#2563EB] text-white" : "bg-gray-100 text-gray-600"}`}>
                          {index + 1}
                        </span>
                        <span className="font-bold text-gray-900 text-lg leading-none">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900 text-lg">{votes}</span>
                        <span className="text-gray-500 text-sm ml-1">suara</span>
                      </div>
                    </div>
                    
                    {/* Progress Bar Container */}
                    <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex items-center">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? "bg-[#2563EB]" : "bg-gray-300"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-1.5 text-xs font-bold text-gray-400 text-right">
                      {percentage}% dari total pemilih
                    </div>
                    
                    {/* Details if not candidate */}
                    {!isCandidateType && ((item as any).philosophy || (item as any).meaning || (item as any).reason) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                        {(item as any).proposer && (
                          <div className="text-xs text-gray-500 mb-2">
                            Diusulkan oleh: <span className="font-semibold text-gray-700">{(item as any).proposer}</span>
                            {(item as any).languageReference && (
                               <span className="ml-2 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">{(item as any).languageReference}</span>
                            )}
                          </div>
                        )}
                        {(item as any).philosophy && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filosofi</span>
                            <p className="text-sm text-gray-700 mt-0.5 italic">"{(item as any).philosophy}"</p>
                          </div>
                        )}
                        {(item as any).meaning && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Makna</span>
                            <p className="text-sm text-gray-700 mt-0.5">{(item as any).meaning}</p>
                          </div>
                        )}
                        {(item as any).mainValue && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nilai Utama</span>
                            <p className="text-sm text-gray-700 mt-0.5">{(item as any).mainValue}</p>
                          </div>
                        )}
                        {(item as any).reason && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Alasan Pengusulan</span>
                            <p className="text-sm text-gray-700 mt-0.5 text-gray-600 italic">{(item as any).reason}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Right Sidebar: Recent Voters Ticker */}
        <div className="lg:col-span-1">
          <RecentVotersTicker votes={election.votes} />
        </div>
      </div>
    </div>
  )
}
