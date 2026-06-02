import { ReactNode } from "react"
import { auth, signOut } from "@/auth"
import { redirect } from "next/navigation"
import { LogOut, LayoutDashboard, User } from "lucide-react"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session || session.user.role !== "MAHASISWA") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent -rotate-6 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar with Glassmorphism */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/20 bg-white/60 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl w-full mx-auto h-full flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl shadow-md p-1 border border-slate-100">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
              E-Voting ITH
            </h2>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-3 bg-white/50 px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                <User size={16} />
              </div>
              <div className="text-sm">
                <p className="text-xs text-slate-500 font-medium">Masuk sebagai</p>
                <p className="font-bold text-slate-800 leading-tight">{session.user.nim}</p>
              </div>
            </div>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 text-sm font-medium">
                <LogOut size={16} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 z-10 relative mt-16 sm:mt-20">
        {children}
      </main>
    </div>
  )
}
