"use client"

import { useState } from "react"
import { read, utils } from "xlsx"
import { useRouter } from "next/navigation"
import { Upload, AlertCircle, CheckCircle, FileWarning } from "lucide-react"

type ImportRow = {
  status: "VALID" | "WARNING" | "ERROR"
  nim: string
  name: string
  email: string
  phoneNumber: string
  studentStatus: string
  dataConsent: string
  notes: string[]
}

export default function ImportStudentsPage() {
  const router = useRouter()
  const [data, setData] = useState<ImportRow[]>([])
  const [loading, setLoading] = useState(false)
  const [fileType, setFileType] = useState<"excel" | "csv">("excel")
  const [importSummary, setImportSummary] = useState<any>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileType(file.name.endsWith(".csv") ? "csv" : "excel")

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = read(bstr, { type: "binary" })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const jsonData = utils.sheet_to_json(ws, { defval: "" }) as any[]

        const parsedData: ImportRow[] = jsonData.map((row: any) => {
          const notes: string[] = []
          let status: "VALID" | "WARNING" | "ERROR" = "VALID"

          const rawNim = row["Nomor Induk Mahasiswa (NIM)"]?.toString().trim()
          const name = row["Nama Lengkap (Sesuai Data Akademik)"]?.toString().trim()
          let email = row["Email Institusi/Pribadi Aktif"]?.toString().trim()
          if (!email) {
            email = row["Email Address"]?.toString().trim()
          }
          const phoneNumber = row["Nomor WhatsApp Aktif"]?.toString().trim() || ""
          const studentStatus = row["Status Kelulusan/Yudisium Anda"]?.toString().trim() || ""
          const dataConsent = row["Persetujuan Data"]?.toString().trim() || ""

          if (!rawNim) {
            status = "ERROR"
            notes.push("NIM kosong")
          }
          if (!name) {
            status = "ERROR"
            notes.push("Nama kosong")
          }
          if (!dataConsent) {
            status = "ERROR"
            notes.push("Persetujuan Data kosong")
          }
          if (!email) {
            if (status !== "ERROR") status = "WARNING"
            notes.push("Email kosong")
          }

          return {
            nim: rawNim || "",
            name: name || "",
            email: email || "",
            phoneNumber,
            studentStatus,
            dataConsent,
            status,
            notes
          }
        })

        // Check for duplicates within the file
        const nimCounts = new Map<string, number>()
        parsedData.forEach(r => {
          if (r.nim) nimCounts.set(r.nim, (nimCounts.get(r.nim) || 0) + 1)
        })
        parsedData.forEach(r => {
          if (r.nim && (nimCounts.get(r.nim) || 0) > 1) {
            r.status = "ERROR"
            r.notes.push("NIM duplikat dalam file")
          }
        })

        setData(parsedData.filter(r => r.nim || r.name)) // filter completely empty rows
      } catch (err) {
        alert("Gagal membaca file. Pastikan formatnya benar.")
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async (strategy: "skip" | "update") => {
    const validData = data.filter(r => r.status !== "ERROR")
    if (validData.length === 0) return alert("Tidak ada data valid untuk diimport")

    setLoading(true)
    try {
      const res = await fetch("/api/admin/import-students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: validData, strategy, fileType })
      })

      const result = await res.json()
      if (res.ok) {
        setImportSummary(result)
      } else {
        alert("Error: " + result.message)
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Import Data Mahasiswa</h1>
      
      {!importSummary ? (
        <>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">1. Upload File</h2>
            <p className="text-sm text-gray-600 mb-4">
              Pilih file .xlsx atau .csv dari Google Form. Pastikan kolom sesuai format: 
              <strong> Nama Lengkap (Sesuai Data Akademik), Nomor Induk Mahasiswa (NIM), Email Institusi/Pribadi Aktif, Nomor WhatsApp Aktif, Status Kelulusan/Yudisium Anda, Persetujuan Data</strong>.
            </p>
            <input 
              type="file" 
              accept=".xlsx,.csv" 
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          {data.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">2. Preview Data ({data.length} baris)</h2>
                <div className="space-x-3">
                  <button 
                    onClick={() => handleImport("skip")}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Import (Skip Duplikat)"}
                  </button>
                  <button 
                    onClick={() => handleImport("update")}
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Import (Update Duplikat)"}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">NIM</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Nama</th>
                      <th className="px-4 py-3 text-left font-medium text-gray-500">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((row, i) => (
                      <tr key={i} className={row.status === "ERROR" ? "bg-red-50" : row.status === "WARNING" ? "bg-yellow-50" : ""}>
                        <td className="px-4 py-3">
                          {row.status === "VALID" && <span className="text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={16}/> Valid</span>}
                          {row.status === "WARNING" && <span className="text-yellow-600 font-semibold flex items-center gap-1"><FileWarning size={16}/> Warning</span>}
                          {row.status === "ERROR" && <span className="text-red-600 font-semibold flex items-center gap-1"><AlertCircle size={16}/> Error</span>}
                        </td>
                        <td className="px-4 py-3 font-medium">{row.nim}</td>
                        <td className="px-4 py-3">{row.name}</td>
                        <td className="px-4 py-3 text-red-500 text-xs">{row.notes.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Selesai</h2>
          <p className="text-gray-600 mb-6">Proses import data mahasiswa telah selesai dijalankan.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Dibaca</div>
              <div className="text-2xl font-bold text-gray-900">{importSummary.totalRead}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="text-xs text-green-600 uppercase tracking-wide">Berhasil / Baru</div>
              <div className="text-2xl font-bold text-green-700">{importSummary.totalImported}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-xs text-blue-600 uppercase tracking-wide">Diupdate</div>
              <div className="text-2xl font-bold text-blue-700">{importSummary.totalUpdated}</div>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 uppercase tracking-wide">Dilewati</div>
              <div className="text-2xl font-bold text-slate-700">{importSummary.totalSkipped}</div>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/admin/students")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            Kembali ke Manajemen Mahasiswa
          </button>
        </div>
      )}
    </div>
  )
}
