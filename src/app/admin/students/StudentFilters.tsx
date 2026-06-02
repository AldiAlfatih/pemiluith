"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { useTransition } from "react"

export default function StudentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set("q", term)
    } else {
      params.delete("q")
    }
    
    startTransition(() => {
      router.replace(`/admin/students?${params.toString()}`)
    })
  }

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    if (status) {
      params.set("status", status)
    } else {
      params.delete("status")
    }
    
    startTransition(() => {
      router.replace(`/admin/students?${params.toString()}`)
    })
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    if (sort) {
      params.set("sort", sort)
    } else {
      params.delete("sort")
    }
    
    startTransition(() => {
      router.replace(`/admin/students?${params.toString()}`)
    })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
          placeholder="Cari berdasarkan Nama atau NIM..."
          defaultValue={searchParams.get("q")?.toString()}
          onChange={(e) => {
            const val = e.target.value
            // use a simple debounce pattern inside transition
            setTimeout(() => handleSearch(val), 300)
          }}
        />
      </div>
      <div className="relative sm:w-48">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Filter className="h-4 w-4 text-slate-400" />
        </div>
        <select
          className="block w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition-all"
          defaultValue={searchParams.get("status")?.toString() || ""}
          onChange={(e) => handleStatusChange(e.target.value)}
        >
          <option value="">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
      <div className="relative sm:w-48">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
        </div>
        <select
          className="block w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none cursor-pointer transition-all"
          defaultValue={searchParams.get("sort")?.toString() || ""}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="">Urutkan (Default)</option>
          <option value="nim_asc">NIM (A-Z)</option>
          <option value="nim_desc">NIM (Z-A)</option>
          <option value="name_asc">Nama (A-Z)</option>
          <option value="name_desc">Nama (Z-A)</option>
          <option value="newest">Terbaru Ditambahkan</option>
        </select>
      </div>
    </div>
  )
}
