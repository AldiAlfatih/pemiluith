"use client"

import { useState } from "react"
import Link from "next/link"
import { closeElectionEarly, deleteElection } from "./actions"
import { Ban, Trash2, Edit } from "lucide-react"

export default function ElectionActionButtons({ electionId, isActive }: { electionId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm("Apakah Anda yakin ingin membatalkan dan menutup pemilihan ini sekarang? Suara yang telah masuk akan tetap tersimpan tetapi mahasiswa tidak bisa lagi memberikan suara.")) return
    
    setLoading(true)
    try {
      await closeElectionEarly(electionId)
    } catch (err: any) {
      alert(err.message || "Gagal menutup pemilihan")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const userInput = prompt('Ketik "HAPUS" untuk menghapus seluruh data pemilihan ini secara permanen beserta suaranya.')
    if (userInput !== "HAPUS") return

    setLoading(true)
    try {
      await deleteElection(electionId)
    } catch (err: any) {
      alert(err.message || "Gagal menghapus")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link 
        href={`/admin/elections/${electionId}/edit`}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
      >
        <Edit size={16} /> Edit
      </Link>
      {isActive && (
        <button 
          onClick={handleCancel}
          disabled={loading}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
        >
          <Ban size={16} /> Batalkan
        </button>
      )}
      <button 
        onClick={handleDelete}
        disabled={loading}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} /> Hapus
      </button>
    </>
  )
}
