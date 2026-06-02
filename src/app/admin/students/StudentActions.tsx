"use client"

import { useState } from "react"
import { Trash2, KeyRound } from "lucide-react"
import { deleteStudent, resetPassword } from "./actions"
import Swal from "sweetalert2"

export default function StudentActions({ id, nim, name }: { id: string, nim: string, name: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Hapus Mahasiswa?',
      text: `Apakah Anda yakin ingin menghapus mahasiswa ${name} (${nim})? Data voting yang telah masuk akan tetap terjaga secara anonim.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      setIsDeleting(true)
      try {
        await deleteStudent(id)
        Swal.fire('Terhapus!', 'Data mahasiswa berhasil dihapus.', 'success')
      } catch (err) {
        Swal.fire('Error', 'Gagal menghapus mahasiswa', 'error')
        setIsDeleting(false)
      }
    }
  }

  const handleReset = async () => {
    const result = await Swal.fire({
      title: 'Reset Password?',
      text: `Reset password untuk ${name} (${nim}) kembali ke NIM (default)?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F97316',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Reset',
      cancelButtonText: 'Batal'
    })

    if (result.isConfirmed) {
      setIsResetting(true)
      try {
        await resetPassword(id)
        Swal.fire('Berhasil!', `Password untuk ${nim} berhasil di-reset.`, 'success')
      } catch (err) {
        Swal.fire('Error', 'Gagal mereset password', 'error')
      } finally {
        setIsResetting(false)
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleReset}
        disabled={isResetting}
        title="Reset Password"
        className="p-1.5 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-50"
      >
        <KeyRound size={16} />
      </button>
      <button 
        onClick={handleDelete}
        disabled={isDeleting}
        title="Hapus Mahasiswa"
        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
