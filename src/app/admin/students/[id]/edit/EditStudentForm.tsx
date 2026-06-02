"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"
import { updateStudent } from "../../actions"

export default function EditStudentForm({ student }: { student: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isActive, setIsActive] = useState(student.isActive)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("isActive", isActive.toString())
      await updateStudent(student.id, formData)
      router.push("/admin/students")
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui data mahasiswa")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">{error}</div>}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">NIM <span className="text-red-500">*</span></label>
            <input type="text" name="nim" defaultValue={student.nim} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
            <input type="text" name="name" defaultValue={student.name} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Email Pribadi/Institusi</label>
            <input type="email" name="email" defaultValue={student.email || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">Nomor WhatsApp Aktif</label>
            <input type="text" name="phoneNumber" defaultValue={student.phoneNumber || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">Status Kelulusan/Yudisium</label>
          <input type="text" name="studentStatus" defaultValue={student.studentStatus || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input 
            type="checkbox" 
            id="isActive"
            checked={isActive} 
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
          />
          <label htmlFor="isActive" className="text-sm font-semibold text-slate-700 cursor-pointer">
            Akun Aktif (Dapat Login & Memilih)
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50"
          >
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </div>
  )
}
