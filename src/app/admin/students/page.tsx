import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Users, Upload, Plus, Pencil } from "lucide-react"
import StudentActions from "./StudentActions"

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "MAHASISWA" },
    orderBy: { nim: "asc" }
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Mahasiswa</h1>
          <p className="text-sm text-slate-500">Kelola pemilih yang terdaftar dalam sistem.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/admin/students/create"
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            <Plus size={18} />
            Tambah Manual
          </Link>
          <Link 
            href="/admin/students/import"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm text-sm"
          >
            <Upload size={18} />
            Import Excel
          </Link>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mahasiswa</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Sumber</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <p className="font-medium text-slate-600">Belum ada data mahasiswa.</p>
                    <p className="text-sm text-slate-400 mt-1">Silakan import dari Excel atau tambah secara manual.</p>
                  </td>
                </tr>
              ) : (
                students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-900">{student.name}</div>
                          <div className="text-sm text-slate-500">{student.nim} • {student.email || "Tanpa Email"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {student.isActive ? (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-green-50 text-green-700 border border-green-200">Aktif</span>
                      ) : (
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-red-50 text-red-700 border border-red-200">Nonaktif</span>
                      )}
                      {student.mustChangePassword && (
                        <span className="ml-2 px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-orange-50 text-orange-700 border border-orange-200" title="Belum login / belum ganti password default">New</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {student.importSource === 'excel_upload' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">Excel</span>
                      ) : student.importSource === 'csv_upload' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700">CSV</span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">Manual</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/admin/students/${student.id}/edit`}
                          className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          title="Edit Data"
                        >
                          <Pencil size={16} />
                        </Link>
                        <StudentActions id={student.id} nim={student.nim} name={student.name} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
