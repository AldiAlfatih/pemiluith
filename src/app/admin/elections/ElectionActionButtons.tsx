"use client"

import { useState } from "react"
import Link from "next/link"
import { closeElectionEarly, deleteElection } from "./actions"
import { Ban, Trash2, Edit, BarChart3 } from "lucide-react"
import Swal from "sweetalert2"

export default function ElectionActionButtons({ electionId, isActive }: { electionId: string, isActive: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: 'Tutup Pemilihan?',
      text: "Apakah Anda yakin ingin membatalkan dan menutup pemilihan ini sekarang? Suara yang telah masuk akan tetap tersimpan tetapi mahasiswa tidak bisa lagi memberikan suara.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F59E0B',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Tutup Sekarang',
      cancelButtonText: 'Batal'
    })
    
    if (!result.isConfirmed) return
    
    setLoading(true)
    try {
      await closeElectionEarly(electionId)
      Swal.fire('Berhasil', 'Pemilihan telah ditutup.', 'success')
    } catch (err: any) {
      Swal.fire('Error', err.message || "Gagal menutup pemilihan", 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const { value: userInput } = await Swal.fire({
      title: 'Hapus Pemilihan?',
      html: 'Ketik <b>HAPUS</b> untuk menghapus seluruh data pemilihan ini secara permanen beserta suaranya.',
      input: 'text',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Hapus Permanen',
      cancelButtonText: 'Batal',
      inputValidator: (value) => {
        if (value !== "HAPUS") {
          return 'Anda harus mengetik "HAPUS" untuk mengkonfirmasi!'
        }
      }
    })

    if (userInput !== "HAPUS") return

    setLoading(true)
    try {
      await deleteElection(electionId)
      Swal.fire('Terhapus!', 'Data pemilihan telah dihapus.', 'success')
    } catch (err: any) {
      Swal.fire('Error', err.message || "Gagal menghapus", 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Link 
        href={`/admin/elections/${electionId}/results`}
        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
      >
        <BarChart3 size={16} /> Hasil
      </Link>
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
