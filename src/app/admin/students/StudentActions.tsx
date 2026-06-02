"use client"

import { useState } from "react"
import { Trash2, KeyRound } from "lucide-react"
import { deleteStudent, resetPassword } from "./actions"

export default function StudentActions({ id, nim, name }: { id: string, nim: string, name: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleDelete = async () => {
    if (confirm(`Apakah Anda yakin ingin menghapus mahasiswa ${name} (${nim})? Data voting yang telah masuk akan tetap terjaga secara anonim jika diatur demikian.`)) {
      setIsDeleting(true)
      try {
        await deleteStudent(id)
      } catch (err) {
        alert("Gagal menghapus mahasiswa")
        setIsDeleting(false)
      }
    }
  }

  const handleReset = async () => {
    if (confirm(`Reset password untuk ${name} (${nim}) kembali ke NIM (default)?`)) {
      setIsResetting(true)
      try {
        await resetPassword(id)
        alert(`Password untuk ${nim} berhasil di-reset.`)
      } catch (err) {
        alert("Gagal mereset password")
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
