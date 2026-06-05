"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, Vote, LogOut, Menu, X } from "lucide-react"

export default function AdminSidebar({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/elections", icon: Vote, label: "Manajemen Pemilu" },
    { href: "/admin/students", icon: Users, label: "Data Mahasiswa" },
  ]

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between gap-3 border-b border-orange-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm p-1">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-orange-900 tracking-tight">AdminPanel</h2>
            <p className="text-xs text-orange-600 font-medium">E-Voting ITH</p>
          </div>
        </div>
        <button className="md:hidden text-orange-800" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <div className="px-4 py-6 overflow-y-auto flex-1">
        <p className="px-4 text-xs font-bold uppercase tracking-wider text-orange-400 mb-2">Menu Utama</p>
        <nav className="space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname?.startsWith(link.href))
            return (
              <Link 
                key={link.href}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive 
                    ? "bg-orange-200/50 text-orange-900 font-bold" 
                    : "text-orange-700 hover:bg-orange-100 hover:text-orange-900"
                }`}
              >
                <link.icon size={20} className={isActive ? "text-orange-600" : "text-orange-400 group-hover:text-orange-600"} />
                <span className={isActive ? "font-bold" : "font-medium"}>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-orange-200/60">
        <div className="bg-orange-100/50 rounded-xl p-4 mb-4 border border-orange-200/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-300 flex items-center justify-center text-orange-900 font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-orange-900 truncate">{userName}</p>
            <p className="text-xs text-orange-600 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#FFF4ED] border-b border-orange-200 z-30 flex items-center px-4 shadow-sm">
        <button onClick={() => setIsOpen(true)} className="p-2 text-orange-800 bg-orange-100 rounded-lg">
          <Menu size={24} />
        </button>
        <div className="ml-4 flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-orange-900">AdminPanel</span>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-orange-900/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#FFF4ED] border-r border-orange-100 flex flex-col z-50 transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <SidebarContent />
      </aside>
    </>
  )
}
