"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { createElection } from "../actions"

export default function CreateElectionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      await createElection(formData)
      router.push("/admin/elections")
    } catch (err: any) {
      setError(err.message || "Gagal membuat pemilihan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/elections" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buat Kegiatan Voting Baru</h1>
          <p className="text-sm text-slate-500">Atur rincian dan jadwal pemilihan.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Judul Voting <span className="text-red-500">*</span></label>
            <input type="text" name="title" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Contoh: Pemilihan Ketua Angkatan 1" />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Deskripsi / Keterangan</label>
            <textarea name="description" rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" placeholder="Tuliskan keterangan singkat mengenai voting ini..."></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Jenis Kegiatan <span className="text-red-500">*</span></label>
              <select name="type" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white">
                <option value="KETUA_ANGKATAN">Ketua Angkatan (Kandidat Personal)</option>
                <option value="NAMA_ANGKATAN">Nama Angkatan (Opsi Nama & Filosofi)</option>
                <option value="LOGO">Logo Angkatan</option>
                <option value="POLLING">Polling Umum</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Metode Pemilihan <span className="text-red-500">*</span></label>
              <select name="method" required onChange={(e) => {
                const el = document.getElementById('multipleChoiceSettings')
                if (el) el.style.display = e.target.value === 'MULTIPLE_CHOICE' ? 'grid' : 'none'
              }} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white">
                <option value="SINGLE_CHOICE">Pilih Satu (Single Choice)</option>
                <option value="MULTIPLE_CHOICE">Pilih Banyak (Multiple Choice)</option>
              </select>
            </div>
          </div>

          <div id="multipleChoiceSettings" className="grid-cols-1 sm:grid-cols-2 gap-6 hidden bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Minimal Pilihan <span className="text-red-500">*</span></label>
              <input type="number" name="minChoices" min="1" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white" />
              <p className="text-xs text-slate-500">Jumlah minimal opsi yang harus dicentang mahasiswa.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Maksimal Pilihan <span className="text-red-500">*</span></label>
              <input type="number" name="maxChoices" min="1" defaultValue="1" className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white" />
              <p className="text-xs text-slate-500">Batas maksimal opsi yang bisa dicentang mahasiswa.</p>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex items-center h-5 mt-1">
                <input 
                  type="checkbox" 
                  name="isComingSoon" 
                  className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const startInput = document.querySelector('input[name="startAt"]') as HTMLInputElement;
                    const endInput = document.querySelector('input[name="endAt"]') as HTMLInputElement;
                    if (startInput) startInput.required = !isChecked;
                    if (endInput) endInput.required = !isChecked;
                  }}
                />
              </div>
              <div>
                <span className="block text-sm font-bold text-amber-900">Tandai sebagai "Coming Soon"</span>
                <span className="block text-xs text-amber-700 mt-1">Jika dicentang, mahasiswa hanya akan melihat status "Segera Hadir". Anda tidak diwajibkan untuk mengisi waktu mulai dan selesai sekarang.</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Waktu Dimulai <span className="text-slate-400 font-normal text-xs">(Abaikan jika Coming Soon)</span></label>
              <input type="datetime-local" name="startAt" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Waktu Ditutup <span className="text-slate-400 font-normal text-xs">(Abaikan jika Coming Soon)</span></label>
              <input type="datetime-local" name="endAt" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-orange-500/30 hover:-translate-y-0.5"
            >
              <Save size={18} /> {loading ? "Menyimpan..." : "Lanjut Tambah Kandidat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
