"use client"

import { useState } from "react"
import { addOption, updateOption, toggleOptionStatus } from "../../actions"
import { PlusCircle, Save, X, Edit, Eye, EyeOff } from "lucide-react"

export default function ManageOptionsClient({ electionId, options }: { electionId: string, options: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      if (editingId) {
        await updateOption(editingId, electionId, formData)
        setEditingId(null)
      } else {
        await addOption(electionId, formData)
        setIsAdding(false)
      }
    } catch (err: any) {
      alert(err.message || "Gagal menyimpan opsi")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setLoading(true)
      await toggleOptionStatus(id, electionId, !currentStatus)
    } catch (err: any) {
      alert("Gagal mengubah status: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {options.length === 0 ? (
        <div className="bg-slate-50 p-8 rounded-2xl text-center border border-dashed border-slate-200">
          <p className="text-slate-500 mb-4">Belum ada opsi/pilihan yang ditambahkan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((o) => (
            <div key={o.id} className={`bg-white border p-4 rounded-2xl flex flex-col justify-between ${!o.isActive ? 'border-red-200 opacity-75' : 'border-slate-200'}`}>
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-slate-800">{o.name}</h4>
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${o.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {o.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                {o.philosophy && <p className="text-sm text-slate-600 mt-2 line-clamp-3">Filosofi: {o.philosophy}</p>}
                {o.meaning && <p className="text-sm text-slate-600 mt-1 line-clamp-2">Makna: {o.meaning}</p>}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setEditingId(o.id)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(o.id, o.isActive)}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${o.isActive ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                >
                  {o.isActive ? <><EyeOff size={16} /> Nonaktifkan</> : <><Eye size={16} /> Aktifkan</>}
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
          <PlusCircle size={18} /> Tambah Opsi Baru
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800">{editingId ? 'Edit Opsi' : 'Form Tambah Opsi'}</h3>
            <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-1 hover:bg-slate-200 rounded-md"><X size={18}/></button>
          </div>
          
          {(() => {
            const editData = editingId ? options.find(o => o.id === editingId) : null;
            return (
              <>
                <input type="text" name="name" required placeholder="Nama Opsi / Judul *" defaultValue={editData?.name || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
                <textarea name="philosophy" rows={3} placeholder="Filosofi (Opsional)" defaultValue={editData?.philosophy || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
                <textarea name="meaning" rows={2} placeholder="Makna (Opsional)" defaultValue={editData?.meaning || ""} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
              </>
            )
          })()}
          
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Opsi"}
          </button>
        </form>
      )}
    </div>
  )
}
