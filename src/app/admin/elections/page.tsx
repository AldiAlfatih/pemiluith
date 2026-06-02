import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Vote, Plus, Settings2, Trash2 } from "lucide-react"
import { format } from "date-fns"
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
              <div key={election.id} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:border-blue-200 transition-colors">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                      isActive ? "bg-green-50 text-green-700 border-green-200" :
                      isUpcoming ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-50 text-slate-600 border-slate-200"
                    }`}>
                      {isActive ? "AKTIF" : isUpcoming ? "MENUNGGU" : "SELESAI"}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                      {election.type.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{election.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                    <span>Mulai: {format(election.startAt, "dd MMM yy, HH:mm", { locale: id })}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Selesai: {format(election.endAt, "dd MMM yy, HH:mm", { locale: id })}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-800">{totalItems}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Kandidat/Opsi</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-800">{election._count.votes}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Suara Masuk</p>
                    </div>
                  </div>

                  <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <Link 
                      href={`/admin/elections/${election.id}/manage`}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                      <Settings2 size={16} /> Kelola
                    </Link>
                    <ElectionActionButtons electionId={election.id} isActive={isActive} />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
