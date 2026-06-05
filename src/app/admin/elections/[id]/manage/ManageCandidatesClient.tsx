"use client"

import { useState } from "react"
import { addCandidate, updateCandidate, toggleCandidateStatus, deleteCandidate } from "../../actions"
import { UserPlus, Save, X, Edit, Eye, EyeOff, Trash2 } from "lucide-react"
import { getDirectImageUrl } from "@/lib/utils"
import ConfirmModal from "@/components/ConfirmModal"

export default function ManageCandidatesClient({ electionId, candidates }: { electionId: string, candidates: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string>("")

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        const MAX = 400;
        if (width > height) {
          if (width > MAX) {
            height *= MAX / width;
            width = MAX;
          }
        } else {
          if (height > MAX) {
            width *= MAX / height;
            height = MAX;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        setPhotoBase64(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };
  
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

  const executeDelete = async () => {
    if (!itemToDelete) return
    try {
      setLoading(true)
      await deleteCandidate(itemToDelete, electionId)
      setItemToDelete(null)
    } catch (err: any) {
      alert("Gagal menghapus: " + err.message)
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
                {c.photoUrl ? (
                  <img 
                    src={getDirectImageUrl(c.photoUrl)} 
                    alt={c.name} 
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-slate-200" 
                    onError={(e) => {
                      // Fallback to showing initials if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      e.currentTarget.nextElementSibling?.classList.add('flex');
                    }}
                  />
                ) : null}
                <div className={`w-16 h-16 bg-blue-100 text-blue-600 rounded-xl items-center justify-center font-bold text-xl flex-shrink-0 ${c.photoUrl ? 'hidden' : 'flex'}`}>
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
                  onClick={() => { setEditingId(c.id); setPhotoBase64(""); }}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Edit size={14} /> Edit
                </button>
                <button 
                  onClick={() => handleToggleStatus(c.id, c.isActive)}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${c.isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-600' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
                >
                  {c.isActive ? <><EyeOff size={14} /> Nonaktifkan</> : <><Eye size={14} /> Aktifkan</>}
                </button>
                <button 
                  onClick={() => setItemToDelete(c.id)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => { setIsAdding(true); setPhotoBase64(""); }}
        className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-orange-200 text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-colors"
      >
        <UserPlus size={18} /> Tambah Kandidat Baru
      </button>

      {/* Modal / Popup Form */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-xl text-slate-800">{editingId ? 'Edit Kandidat' : 'Tambah Kandidat Baru'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); setPhotoBase64(""); }} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="candidate-form" onSubmit={handleSubmit} className="space-y-4">
                {(() => {
                  const editData = editingId ? candidates.find(c => c.id === editingId) : null;
                  return (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Kandidat <span className="text-red-500">*</span></label>
                        <input type="text" name="name" required placeholder="Cth: Budi Santoso" defaultValue={editData?.name || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">NIM <span className="text-red-500">*</span></label>
                          <input type="text" name="nim" required placeholder="NIM kandidat" defaultValue={editData?.nim || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1">Program Studi <span className="text-red-500">*</span></label>
                          <input type="text" name="programStudy" required placeholder="Cth: Ilmu Komputer" defaultValue={editData?.programStudy || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Visi <span className="text-slate-400 font-normal">(Opsional)</span></label>
                        <textarea name="vision" rows={3} placeholder="Tuliskan visi kandidat..." defaultValue={editData?.vision || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Misi <span className="text-slate-400 font-normal">(Opsional)</span></label>
                        <textarea name="mission" rows={4} placeholder="Tuliskan misi kandidat..." defaultValue={editData?.mission || ""} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 mb-3">Tautan & Media (Opsional)</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Foto Profil</label>
                            <div className="flex items-center gap-3">
                              {(photoBase64 || editData?.photoUrl) && (
                                <img src={photoBase64 || getDirectImageUrl(editData.photoUrl)} className="w-12 h-12 rounded-lg object-cover border border-slate-200" alt="Preview" />
                              )}
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer" />
                              <input type="hidden" name="photoUrl" value={photoBase64 || editData?.photoUrl || ""} />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">URL LinkedIn</label>
                            <input type="url" name="linkedinUrl" placeholder="https://linkedin.com/in/..." defaultValue={editData?.linkedinUrl || ""} className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Instagram</label>
                              <input type="url" name="instagramUrl" placeholder="https://instagram.com/..." defaultValue={editData?.instagramUrl || ""} className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">URL Portofolio</label>
                              <input type="url" name="portfolioUrl" placeholder="https://..." defaultValue={editData?.portfolioUrl || ""} className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )
                })()}
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => { setIsAdding(false); setEditingId(null); setPhotoBase64(""); }} className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors">
                Batal
              </button>
              <button form="candidate-form" type="submit" disabled={loading} className="flex-1 flex justify-center items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-colors shadow-sm hover:shadow">
                <Save size={18} /> {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={executeDelete}
        title="Hapus Kandidat"
        message="Yakin ingin menghapus kandidat ini? Tindakan ini tidak dapat dibatalkan."
        loading={loading}
      />
    </div>
  )
}
