"use client"

import { useState } from "react"
import { addOption } from "../../actions"
import { PlusCircle, Save, X } from "lucide-react"

export default function ManageOptionsClient({ electionId, options }: { electionId: string, options: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await addOption(electionId, formData)
      setIsAdding(false)
    } catch (err: any) {
      alert(err.message || "Gagal menambah opsi")
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
            <div key={o.id} className="bg-white border border-slate-200 p-4 rounded-2xl">
              <h4 className="font-bold text-lg text-slate-800">{o.name}</h4>
              {o.philosophy && <p className="text-sm text-slate-600 mt-2 line-clamp-3">Filosofi: {o.philosophy}</p>}
              {o.meaning && <p className="text-sm text-slate-600 mt-1 line-clamp-2">Makna: {o.meaning}</p>}
            </div>
          ))}
        </div>
      )}

      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-colors"
        >
          <PlusCircle size={18} /> Tambah Opsi Baru
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-slate-800">Form Tambah Opsi</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="p-1 hover:bg-slate-200 rounded-md"><X size={18}/></button>
          </div>
          
          <input type="text" name="name" required placeholder="Nama Opsi / Judul *" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none" />
          <textarea name="philosophy" rows={3} placeholder="Filosofi (Opsional)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
          <textarea name="meaning" rows={2} placeholder="Makna (Opsional)" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"></textarea>
          
          <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl disabled:opacity-50">
            <Save size={18} /> {loading ? "Menyimpan..." : "Simpan Opsi"}
          </button>
        </form>
      )}
    </div>
  )
}
