import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import EditStudentForm from "./EditStudentForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const student = await prisma.user.findUnique({
    where: { id, role: "MAHASISWA" }
  })

  if (!student) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/students" className="p-2 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Data Mahasiswa</h1>
          <p className="text-sm text-slate-500">Perbarui informasi untuk {student.name}</p>
        </div>
      </div>

      <EditStudentForm student={student} />
    </div>
  )
}
