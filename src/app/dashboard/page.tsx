import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import { Calendar, CheckCircle, Clock, ChevronRight, Vote } from "lucide-react"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { id } from "date-fns/locale"
import DashboardSearch from "./DashboardSearch"
import { Suspense } from "react"
import CountdownTimer from "@/components/CountdownTimer"
import PushNotificationManager from "@/components/PushNotificationManager"

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const session = await auth()
  const userId = session?.user.id as string

  // Build query
  const whereClause: any = {
    status: { in: ["ACTIVE", "CLOSED"] }
  }

  if (q) {
    whereClause.title = { contains: q, mode: "insensitive" }
  }

  // Fetch active and upcoming elections
  const elections = await prisma.election.findMany({
    where: whereClause,
    orderBy: { startAt: "desc" },
    include: {
      votes: {
        where: { userId }
      },
      _count: {
        select: { votes: true }
      }
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <PushNotificationManager />

      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Halo, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{session?.user.name}</span>!
          </h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl">
            Selamat datang di Portal E-Voting Angkatan 1 Institut Teknologi Bacharuddin Jusuf Habibie. Suara Anda menentukan masa depan angkatan kita.
          </p>
        </div>
      </div>
      
      {/* Elections Section */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50/80 p-1.5 rounded-lg border border-blue-100 flex justify-center items-center">
              <Vote size={24} className="text-blue-600" />
            </div>
            Daftar Kegiatan Pemilihan
          </h2>
          <Suspense fallback={<div className="h-10 w-64 bg-slate-100 rounded-xl animate-pulse" />}>
            <DashboardSearch />
          </Suspense>
        </div>
        
        {elections.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm p-12 rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">Belum Ada Pemilihan</h3>
            <p className="text-slate-500 mt-2 max-w-sm">Saat ini tidak ada kegiatan E-Voting yang sedang berlangsung atau akan datang.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {elections.map((election: any, i: number) => {
              // The query filters votes by userId, so if length > 0, THIS user has voted
              const hasVoted = election.votes && election.votes.length > 0
              const now = new Date()
              const hasNoDates = !election.startAt || !election.endAt
              const isUpcoming = election.startAt ? now < new Date(election.startAt) : false
              const isComingSoonStatus = election.isComingSoon && (hasNoDates || isUpcoming)
              const isClosed = (!hasNoDates && now > new Date(election.endAt)) || election.status === "CLOSED"
              const isActive = (!hasNoDates && !isUpcoming && !isClosed && election.status === "ACTIVE") || (election.status === "ACTIVE" && !hasNoDates && !isUpcoming && !isClosed)
              const totalVotes = election._count.votes

              return (
                <div 
                  key={election.id} 
                  className="group relative bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  
                  <div className="p-6 border-b border-slate-50">
                    <div className="flex flex-wrap items-start gap-2 mb-4">
                      <span className={`px-3 py-1.5 text-[11px] font-bold rounded-full border whitespace-nowrap ${
                        isActive ? "bg-green-50 text-green-700 border-green-200" :
                        isComingSoonStatus ? "bg-amber-50 text-amber-700 border-amber-200" :
                        isUpcoming ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {isActive ? (
                          <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" /> SEDANG BERLANGSUNG</span>
                        ) : isComingSoonStatus ? "⏳ SEGERA HADIR" : isUpcoming ? "⏳ AKAN DATANG" : "⚫ SELESAI"}
                      </span>
                      {hasVoted && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
                          <CheckCircle size={14} /> SUDAH MEMILIH
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-2 mt-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">{election.title}</h3>
                      {isActive && election.endAt && (
                         <div className="shrink-0 mt-0.5">
                           <CountdownTimer targetDate={election.endAt} />
                         </div>
                      )}
                      {isUpcoming && election.startAt && (
                         <div className="shrink-0 mt-0.5">
                           <div className="text-[10px] text-slate-500 font-bold mb-1 text-right">Dimulai dalam:</div>
                           <CountdownTimer targetDate={election.startAt} mode="start" />
                         </div>
                      )}
                    </div>
                    {election.description && election.description.replace(/\n?<!--\[HIDE_VOTES\]-->/g, "").trim() !== "" && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">{election.description.replace(/\n?<!--\[HIDE_VOTES\]-->/g, "").trim()}</p>
                  )}</div>
                  
                  <div className="p-6 bg-slate-50/50 flex-1 flex flex-col justify-end">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 mb-5 space-y-3 shadow-sm">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-slate-400">Mulai</span>
                        <span className="text-slate-800">{election.startAt ? formatInTimeZone(election.startAt, 'Asia/Makassar', "dd MMM yyyy, HH:mm 'WITA'", { locale: id }) : 'Menunggu Jadwal'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-medium border-t border-slate-50 pt-2">
                        <span className="text-slate-400">Selesai</span>
                        <span className="text-slate-800">{election.endAt ? formatInTimeZone(election.endAt, 'Asia/Makassar', "dd MMM yyyy, HH:mm 'WITA'", { locale: id }) : 'Menunggu Jadwal'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-medium border-t border-slate-50 pt-2">
                        <span className="text-slate-400">Total Suara</span>
                        <span className="text-blue-700 font-bold px-2 py-1 bg-blue-50 rounded-lg">{totalVotes} Masuk</span>
                      </div>
                    </div>
                    
                    {isActive && !hasVoted ? (
                      <Link 
                        href={`/dashboard/vote/${election.id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
                      >
                        Mulai Memilih <ChevronRight size={18} />
                      </Link>
                    ) : hasVoted || (isClosed && election.showResultAfterClosed) || election.showLiveResult ? (
                      <Link 
                        href={`/dashboard/results/${election.id}`}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02]"
                      >
                        Lihat Hasil (Live) <ChevronRight size={18} />
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="w-full py-3 text-center bg-slate-200/70 text-slate-400 font-bold rounded-xl cursor-not-allowed border border-slate-200"
                      >
                        {hasVoted ? "Terima Kasih Atas Partisipasi Anda" : isUpcoming ? "Belum Dibuka" : "Ditutup"}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
