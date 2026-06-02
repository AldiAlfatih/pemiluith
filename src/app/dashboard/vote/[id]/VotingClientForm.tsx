"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { submitVote } from "./actions"

type Item = {
  id: string
  name: string
  nim?: string
  programStudy?: string
  vision?: string
  mission?: string
  philosophy?: string
  meaning?: string
}

export default function VotingClientForm({ 
  election, 
  items 
}: { 
  election: any, 
  items: Item[] 
}) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const isMultiple = election.method === "MULTIPLE_CHOICE"

  const toggleSelection = (id: string) => {
    if (isMultiple) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter(i => i !== id))
      } else {
        if (selectedIds.length < election.maxChoices) {
          setSelectedIds([...selectedIds, id])
        }
      }
    } else {
      setSelectedIds([id])
    }
  }

  const handleConfirm = async () => {
    if (selectedIds.length < election.minChoices) {
      setError(`Harap pilih setidaknya ${election.minChoices} pilihan.`)
      return
    }

    if (!confirm("Apakah Anda yakin dengan pilihan Anda? Suara yang telah masuk tidak dapat diubah kembali.")) {
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await submitVote(election.id, selectedIds)
      router.push("/dashboard?success=voted")
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memproses suara Anda.")
      setIsSubmitting(false)
    }
  }

  // Determine styling based on type (Candidates vs Options)
  const isCandidate = election.type === "KETUA_ANGKATAN"

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-md text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id)
          
          return (
            <div 
              key={item.id}
              onClick={() => toggleSelection(item.id)}
              className={`
                relative overflow-hidden bg-white border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 ease-in-out
                ${isSelected 
                  ? "border-[#2563EB] shadow-[0_0_0_4px_rgba(37,99,235,0.1)] ring-1 ring-[#2563EB]" 
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }
              `}
            >
              {/* Custom Image Indicator */}
              <div className="absolute top-6 right-6">
                {isSelected ? (
                  <img src="/check-icon.png" alt="Selected" className="w-8 h-8 drop-shadow-sm" />
                ) : (
                  <div className={`w-8 h-8 border-2 border-gray-300 ${isMultiple ? "rounded-md" : "rounded-full"} bg-transparent`}></div>
                )}
              </div>

              <div className="pr-10">
                {isCandidate ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4 font-medium">{item.nim} — {item.programStudy}</p>
                    
                    {item.vision && (
                      <div className="mt-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Visi</span>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">"{item.vision}"</p>
                      </div>
                    )}
                    
                    {item.mission && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Misi</span>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed whitespace-pre-line">{item.mission}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">{item.name}</h3>
                    
                    {item.philosophy && (
                      <div className="mt-4">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filosofi</span>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">"{item.philosophy}"</p>
                      </div>
                    )}
                    
                    {item.meaning && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Makna</span>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed">{item.meaning}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 border border-gray-200 rounded-xl bg-gray-50">
          <p className="text-gray-500">Belum ada kandidat atau opsi yang tersedia untuk pemilihan ini.</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="sticky bottom-6 mt-12 bg-white border border-gray-200 shadow-xl rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div>
            <p className="text-sm text-gray-500">
              {isMultiple 
                ? `Anda dapat memilih minimal ${election.minChoices} dan maksimal ${election.maxChoices} opsi.`
                : "Pilih 1 kandidat terbaik menurut Anda."
              }
            </p>
            <p className="text-base font-medium text-gray-900 mt-1">
              Terpilih: <span className="font-bold text-[#2563EB]">{selectedIds.length}</span>
            </p>
          </div>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.length < election.minChoices || isSubmitting}
            className="w-full sm:w-auto bg-[#111827] hover:bg-[#1F2937] text-white font-medium py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Pilihan"}
          </button>
        </div>
      )}
    </div>
  )
}
