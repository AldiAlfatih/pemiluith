import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users, Vote, Activity, ArrowUpRight, CheckCircle2 } from "lucide-react"

export default async function AdminDashboardPage() {
  const totalStudents = await prisma.user.count({ where: { role: "MAHASISWA" } })
  const totalElections = await prisma.election.count()
  const totalVotesCast = await prisma.vote.count()
  
  // Real stats can be implemented later, these are placeholder calculations for UI completeness
  const activeElections = await prisma.election.count({ where: { status: "ACTIVE" } })
  
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Dashboard Statistik</h1>
        <p className="text-slate-500 mt-2">Ringkasan aktivitas sistem E-Voting Angkatan 1 ITH.</p>
      </div>
      
      {/* Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users size={32} className="text-blue-500 opacity-50 ml-4 mt-4" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Total Mahasiswa</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-slate-900">{totalStudents}</p>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">
                <ArrowUpRight size={12} className="mr-0.5" /> Terdaftar
              </span>
            </div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Vote size={32} className="text-purple-500 opacity-50 ml-4 mt-4" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Total Voting</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-slate-900">{totalElections}</p>
              <span className="flex items-center text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md mb-1">
                Dibuat
              </span>
            </div>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={32} className="text-green-500 opacity-50 ml-4 mt-4" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Voting Aktif</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-slate-900">{activeElections}</p>
              <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md mb-1">
                <CheckCircle2 size={12} className="mr-0.5" /> Berjalan
              </span>
            </div>
          </div>
        </div>
        
        {/* Stat Card 4 */}
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Activity size={32} className="text-amber-500 opacity-50 ml-4 mt-4" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 font-semibold text-sm mb-1 uppercase tracking-wider">Total Partisipasi Suara</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-slate-900">{totalVotesCast}</p>
              <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md mb-1">
                Akumulasi
              </span>
            </div>
          </div>
        </div>
        
      </div>
      
      {/* Quick Actions or Info Panels */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-orange-500/20 w-full">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl" />
          <h3 className="text-2xl font-bold mb-2 relative z-10">Jalankan Pemilu Baru</h3>
          <p className="text-orange-50 mb-6 relative z-10 max-w-2xl">
            Buat kegiatan E-Voting untuk Nama Angkatan, Ketua Angkatan, atau polling umum lainnya secara instan.
          </p>
          <Link 
            href="/admin/elections/create"
            className="inline-flex items-center justify-center bg-white text-orange-600 hover:bg-orange-50 font-bold py-3 px-6 rounded-xl transition-colors relative z-10 shadow-sm"
          >
            Buat Voting Sekarang
          </Link>
        </div>
      </div>
      
    </div>
  )
}
