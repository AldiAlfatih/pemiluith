"use client"

import { useState } from "react"
import { BellRing, Mail, MessageSquare, Smartphone, Loader2 } from "lucide-react"
import Swal from "sweetalert2"

export default function BlastNotificationButton({ electionId }: { electionId: string }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  
  const sendBlast = async (method: "push" | "email" | "wa") => {
    if (method === "wa" || method === "email") {
      Swal.fire({
        title: 'Segera Hadir',
        text: 'Fitur pengiriman via WhatsApp dan Email sedang dalam tahap penyesuaian (Coming Soon).',
        icon: 'info'
      })
      return
    }

    const { value: customMessage } = await Swal.fire({
      title: 'Kirim Blast Notifikasi',
      input: 'textarea',
      inputLabel: 'Pesan Kustom (Opsional)',
      inputPlaceholder: 'Kosongkan untuk menggunakan pesan bawaan...',
      showCancelButton: true,
      confirmButtonText: 'Kirim Sekarang',
      cancelButtonText: 'Batal'
    })

    if (customMessage !== undefined) {
      setIsLoading(method)
      try {
        const res = await fetch(`/api/admin/elections/${electionId}/blast`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, customMessage })
        })
        const data = await res.json()
        
        if (res.ok) {
          Swal.fire('Berhasil!', data.message, 'success')
        } else {
          Swal.fire('Gagal', data.error || 'Terjadi kesalahan sistem', 'error')
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghubungi server', 'error')
      } finally {
        setIsLoading(null)
      }
    }
  }

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-3xl p-6 sm:p-8 border border-indigo-100 shadow-sm mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <BellRing size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Blast Pengingat (Otomatis)</h2>
          <p className="text-sm text-slate-500">Kirim notifikasi HANYA kepada mahasiswa yang belum memilih.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button 
          onClick={() => sendBlast("wa")}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-sm group opacity-60"
        >
          <MessageSquare className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-slate-700">Kirim via WhatsApp</span>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Coming Soon</span>
        </button>

        <button 
          onClick={() => sendBlast("email")}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all shadow-sm group opacity-60"
        >
          <Mail className="w-8 h-8 text-slate-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-slate-700">Kirim via Email</span>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Coming Soon</span>
        </button>

        <button 
          onClick={() => sendBlast("push")}
          disabled={isLoading !== null}
          className="flex flex-col items-center justify-center gap-3 p-5 bg-white hover:bg-purple-50 border border-purple-200 rounded-2xl transition-all shadow-sm group disabled:opacity-50"
        >
          {isLoading === "push" ? <Loader2 className="animate-spin text-purple-500 w-8 h-8" /> : <Smartphone className="w-8 h-8 text-purple-600 group-hover:scale-110 transition-transform" />}
          <span className="font-semibold text-slate-700">Kirim Push Notification</span>
        </button>
      </div>
    </div>
  )
}
