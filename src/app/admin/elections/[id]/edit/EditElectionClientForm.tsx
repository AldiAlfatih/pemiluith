"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { updateElection } from "../../actions"

export default function EditElectionClientForm({ election }: { election: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [method, setMethod] = useState(election.method)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      await updateElection(election.id, formData)
      router.push("/admin/elections")
    } catch (err: any) {
      setError(err.message || "Gagal mengubah pemilihan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/elections" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ubah Pengaturan Pemilihan</h1>
          <p className="text-sm text-slate-500">Ubah rincian, jadwal, dan batas pilihan.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Judul Voting <span className="text-red-500">*</span></label>
            <input type="text" name="title" defaultValue={election.title} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">Deskripsi / Keterangan</label>
            <textarea name="description" defaultValue={election.description || ""} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Jenis Kegiatan <span className="text-red-500">*</span></label>
              <select name="type" defaultValue={election.type} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white">
                <option value="KETUA_ANGKATAN">Ketua Angkatan (Kandidat Personal)</option>
                <option value="NAMA_ANGKATAN">Nama Angkatan (Opsi Nama & Filosofi)</option>
                <option value="LOGO">Logo Angkatan</option>
                <option value="POLLING">Polling Umum</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Metode Pemilihan <span className="text-red-500">*</span></label>
              <select name="method" value={method} onChange={(e) => setMethod(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none bg-white">
                <option value="SINGLE_CHOICE">Pilih Satu (Single Choice)</option>
                <option value="MULTIPLE_CHOICE">Pilih Banyak (Multiple Choice)</option>
              </select>
            </div>
          </div>

          {method === 'MULTIPLE_CHOICE' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-blue-50 p-6 rounded-xl border border-blue-100">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Minimal Pilihan <span className="text-red-500">*</span></label>
                <input type="number" name="minChoices" min="1" defaultValue={election.minChoices} className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-700">Maksimal Pilihan <span className="text-red-500">*</span></label>
                <input type="number" name="maxChoices" min="1" defaultValue={election.maxChoices} className="w-full px-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white" />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Waktu Dimulai <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="startAt" defaultValue={new Date(new Date(election.startAt).getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Waktu Ditutup <span className="text-red-500">*</span></label>
              <input type="datetime-local" name="endAt" defaultValue={new Date(new Date(election.endAt).getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
