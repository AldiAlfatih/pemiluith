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
            <textarea name="description" defaultValue={election.description ? election.description.replace(/\n?<!--\[HIDE_VOTES\]-->/g, "") : ""} rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"></textarea>
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

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex items-center h-5 mt-1">
                <input 
                  type="checkbox" 
                  name="isComingSoon" 
                  defaultChecked={election.isComingSoon}
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
                <span className="block text-xs text-amber-700 mt-1">Jika dicentang, mahasiswa hanya akan melihat status "Segera Hadir". Anda tidak diwajibkan untuk mengisi waktu mulai dan selesai.</span>
              </div>
            </label>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="flex items-center h-5 mt-1">
                <input 
                  type="checkbox" 
                  name="hideCandidateVotes" 
                  defaultChecked={election.description?.includes('<!--[HIDE_VOTES]-->') || false}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-800">Sembunyikan Perolehan Suara Kandidat/Opsi</span>
                <span className="block text-xs text-slate-500 mt-1">Jika dicentang, total pemilih dan persentase kehadiran tetap tampil, tetapi angka perolehan spesifik untuk setiap orang/opsi akan disembunyikan di halaman hasil (baik bagi admin maupun mahasiswa).</span>
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Waktu Dimulai <span className="text-slate-400 font-normal text-xs">(Abaikan jika Coming Soon)</span></label>
              <input type="datetime-local" name="startAt" defaultValue={election.startAt ? new Date(new Date(election.startAt).getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16) : ""} required={!election.isComingSoon} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Waktu Ditutup <span className="text-slate-400 font-normal text-xs">(Abaikan jika Coming Soon)</span></label>
              <input type="datetime-local" name="endAt" defaultValue={election.endAt ? new Date(new Date(election.endAt).getTime() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16) : ""} required={!election.isComingSoon} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 shadow-sm shadow-orange-500/30 hover:-translate-y-0.5"
            >
              <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
