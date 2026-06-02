import { ReactNode } from "react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { LayoutDashboard, Users, Vote, LogOut, Settings, Bell } from "lucide-react"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="flex bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-[#0A0F24] text-slate-300 flex flex-col h-screen sticky top-0 z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">AdminPanel</h2>
            <p className="text-xs text-blue-400 font-medium">E-Voting ITH</p>
          </div>
        </div>
        
        <div className="px-4 py-6">
          <p className="px-4 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Menu Utama</p>
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all group">
              <LayoutDashboard size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link href="/admin/elections" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all group">
              <Vote size={20} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
              <span className="font-medium">Manajemen Pemilu</span>
            </Link>
            <Link href="/admin/students" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all group">
              <Users size={20} className="text-slate-400 group-hover:text-green-400 transition-colors" />
              <span className="font-medium">Data Mahasiswa</span>
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-slate-800/80">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-700/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
              <p className="text-xs text-slate-400 truncate">Administrator</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut()
            }}
          >
            <button className="flex w-full items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all font-bold text-sm">
              <LogOut size={18} />
              <span>Keluar Sesi</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen bg-slate-50">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <h1 className="text-xl font-bold text-slate-800">Panel Kendali Sistem</h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
