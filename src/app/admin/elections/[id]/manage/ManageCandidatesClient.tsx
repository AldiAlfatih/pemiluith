"use client"

import { useState } from "react"
import { addCandidate } from "../../actions"
import { UserPlus, Save, X } from "lucide-react"

export default function ManageCandidatesClient({ electionId, candidates }: { electionId: string, candidates: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await addCandidate(electionId, formData)
      setIsAdding(false)
    } catch (err: any) {
      alert(err.message || "Gagal menambah kandidat")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {candidates.length === 0 ? (
        <div className="bg-slate-50 p-8 rounded-2xl text-center border border-dashed border-slate-200">
          <p className="text-slate-500 mb-4">Belum ada kandidat yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex gap-4">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                {c.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{c.name}</h4>
                <p className="text-xs text-slate-500">{c.nim} • {c.programStudy}</p>
                {c.vision && <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">&quot;{c.vision}&quot;</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors"
        >
          <UserPlus size={18} /> Tambah Kandidat Baru
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800">Form Tambah Kandidat</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-200 rounded-md"><X size={18}/></button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" name="name" required placeholder="Nama Lengkap *" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
            <input type="text" name="nim" required placeholder="NIM *" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
          </div>
          <input type="text" name="programStudy" required placeholder="Program Studi *" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
          <textarea name="vision" rows={2} placeholder="Visi (Opsional)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
          <textarea name="mission" rows={2} placeholder="Misi (Opsional)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
          
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Kandidat"}
          </button>
        </form>
      )}
    </div>
  )
}
