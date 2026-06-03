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

      <button 
        onClick={() => setIsAdding(true)}
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors"
      >
        <PlusCircle size={18} /> Tambah Opsi Baru
      </button>

      {/* Modal / Popup Form */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-xl text-slate-800">{editingId ? 'Edit Opsi' : 'Tambah Opsi Baru'}</h3>
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"><X size={20}/></button>
              </div>
              
              {(() => {
                const editData = editingId ? options.find(o => o.id === editingId) : null;
                return (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Opsi / Judul <span className="text-red-500">*</span></label>
                      <input type="text" name="name" required placeholder="Contoh: ROOT" defaultValue={editData?.name || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Filosofi <span className="text-slate-400 font-normal">(Opsional)</span></label>
                      <textarea name="philosophy" rows={3} placeholder="Tuliskan filosofi di sini..." defaultValue={editData?.philosophy || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Makna <span className="text-slate-400 font-normal">(Opsional)</span></label>
                      <textarea name="meaning" rows={2} placeholder="Tuliskan makna singkat..." defaultValue={editData?.meaning || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                    </div>
                  </div>
                )
              })()}
              
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="flex-1 flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors shadow-sm hover:shadow">
                  <Save size={18} /> {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  )
}
