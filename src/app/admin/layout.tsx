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
      {/* Sidebar (Client Component for mobile responsiveness) */}
      <AdminSidebar userName={session.user.name} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen bg-slate-50 md:pt-0 pt-16">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 hidden md:flex items-center justify-between px-8 z-10 sticky top-0">
          <h1 className="text-xl font-bold text-slate-800">Panel Kendali Sistem</h1>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
              <Settings size={20} />
            </button>
            <form
              action={async () => {
                "use server"
                await signOut()
              }}
            >
              <button title="Keluar" className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
