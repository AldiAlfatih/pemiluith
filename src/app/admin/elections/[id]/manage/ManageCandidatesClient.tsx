"use client"

import { useState } from "react"
import { addCandidate, updateCandidate, toggleCandidateStatus } from "../../actions"
import { UserPlus, Save, X, Edit, Eye, EyeOff } from "lucide-react"

export default function ManageCandidatesClient({ electionId, candidates }: { electionId: string, candidates: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      if (editingId) {
        await updateCandidate(editingId, electionId, formData)
        setEditingId(null)
      } else {
        await addCandidate(electionId, formData)
        setIsAdding(false)
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan kandidat")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true)
      await toggleCandidateStatus(id, electionId, !currentStatus)
    } catch (err: any) {
      alert("Gagal mengubah status: " + err.message)
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
            <div key={c.id} className={`bg-white border p-4 rounded-2xl flex flex-col justify-between ${!c.isActive ? 'border-red-200 opacity-75' : 'border-slate-200'}`}>
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800">{c.name}</h4>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{c.nim} • {c.programStudy}</p>
                  {c.vision && <p className="text-xs text-slate-600 mt-2 line-clamp-2 italic">&quot;{c.vision}&quot;</p>}
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setEditingId(c.id)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(c.id, c.isActive)}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${c.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                >
                  {c.isActive ? <><EyeOff size={16} /> Nonaktifkan</> : <><Eye size={16} /> Aktifkan</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isAdding && !editingId ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors"
        >
          <UserPlus size={18} /> Tambah Kandidat Baru
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Kandidat' : 'Form Tambah Kandidat'}</h3>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-1 hover:bg-slate-200 rounded-md"><X size={18}/></button>
          </div>
          
          {(() => {
            const editData = editingId ? candidates.find(c => c.id === editingId) : null;
            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" name="name" required placeholder="Nama Lengkap *" defaultValue={editData?.name || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                  <input type="text" name="nim" required placeholder="NIM *" defaultValue={editData?.nim || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                </div>
                <input type="text" name="programStudy" required placeholder="Program Studi *" defaultValue={editData?.programStudy || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                <textarea name="vision" rows={2} placeholder="Visi (Opsional)" defaultValue={editData?.vision || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
                <textarea name="mission" rows={2} placeholder="Misi (Opsional)" defaultValue={editData?.mission || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
              </>
            )
          })()}
          
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Kandidat"}
          </button>
        </form>
      )}
    </div>
  )
}
