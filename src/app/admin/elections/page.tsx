import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Vote, Plus, Settings2, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { formatInTimeZone } from "date-fns-tz"
import { id } from "date-fns/locale"
import ElectionActionButtons from "./ElectionActionButtons"

export default async function ElectionsPage() {
  const elections = await prisma.election.findMany({
    orderBy: { startAt: "desc" },
    include: {
      _count: {
        select: { candidates: true, options: true, votes: true }
      }
    }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Voting</h1>
          <p className="text-sm text-slate-500">Kelola kegiatan pemilihan, kandidat, dan opsi angkatan.</p>
        </div>
        <Link 
          href="/admin/elections/create"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm shadow-blue-500/20 hover:-translate-y-0.5 text-sm"
        >
          <Plus size={18} />
          Buat Voting Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {elections.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Vote className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">Belum Ada Pemilihan</h3>
            <p className="text-slate-500 mt-1 max-w-sm text-sm">Anda belum membuat kegiatan voting apapun. Klik tombol di atas untuk memulai.</p>
          </div>
        ) : (
          elections.map((election: any) => {
            const now = new Date()
            const isUpcoming = now < election.startAt
            const isClosed = now > election.endAt || election.status === "CLOSED"
            const isActive = !isUpcoming && !isClosed && election.status === "ACTIVE"
            const totalItems = election._count.candidates + election._count.options

            return (
              <div key={election.id} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-5 flex flex-col gap-4 group hover:border-blue-200 transition-colors">
                {/* Top row: badges + stats */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${
                        isActive ? "bg-green-50 text-green-700 border-green-200" :
                        isUpcoming ? "bg-amber-50 text-amber-700 border-amber-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {isActive ? "● AKTIF" : isUpcoming ? "⏳ MENUNGGU" : "✓ SELESAI"}
                      </span>
                      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        {election.type.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">{election.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-400">
                      <span>Mulai: {formatInTimeZone(election.startAt, 'Asia/Makassar', "dd MMM yy, HH:mm 'WITA'", { locale: id })}</span>
                      <span>·</span>
                      <span>Selesai: {formatInTimeZone(election.endAt, 'Asia/Makassar', "dd MMM yy, HH:mm 'WITA'", { locale: id })}</span>
                    </div>
                  </div>

                  {/* Stats chips */}
                  <div className="flex gap-3 flex-shrink-0">
                    <div className="text-center bg-slate-50 px-3 py-2 rounded-xl">
                      <p className="text-xl font-black text-slate-800 leading-none">{totalItems}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Opsi</p>
                    </div>
                    <div className="text-center bg-blue-50 px-3 py-2 rounded-xl">
                      <p className="text-xl font-black text-blue-700 leading-none">{election._count.votes}</p>
                      <p className="text-[9px] font-bold text-blue-400 uppercase mt-0.5">Suara</p>
                    </div>
                  </div>
                </div>

                {/* Bottom row: actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href={`/admin/elections/${election.id}/manage`}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Settings2 size={14} /> Kelola
                  </Link>
                  <Link
                    href={`/admin/elections/${election.id}/results`}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Vote size={14} /> Hasil
                  </Link>
                  <div className="flex-1" />
                  <ElectionActionButtons electionId={election.id} isActive={isActive} />
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
