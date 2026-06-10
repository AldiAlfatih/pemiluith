"use client"

import { useState } from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Search, Filter, Download, UserCheck, Eye, EyeOff } from "lucide-react"

export default function ResultsClient({ election, resultsData, voters, totalVotes }: { 
  election: any, 
  resultsData: Record<string, number>, 
  voters: any[],
  totalVotes: number 
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showChoices, setShowChoices] = useState(false)

  // Sort items by vote count (highest first)
  const isCandidateType = election.type === 'KETUA_ANGKATAN'
  const items = isCandidateType ? election.candidates : election.options
  const sortedItems = [...items].sort((a, b) => (resultsData[b.id] || 0) - (resultsData[a.id] || 0))

  // Filter voters
  const filteredVoters = voters.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.nim.includes(searchTerm)
  )

  const maxVotes = Math.max(...Object.values(resultsData), 1) // Prevent division by zero

  // Find what a voter chose for display
  const getChoiceNames = (details: any[]) => {
    if (!details || details.length === 0) return "-"
    
    return details.map(d => {
      if (d.candidateId) {
        const c = election.candidates.find((x: any) => x.id === d.candidateId)
        return c ? c.name : "Unknown"
      }
      if (d.optionId) {
        const o = election.options.find((x: any) => x.id === d.optionId)
        return o ? o.name : "Unknown"
      }
      return "Unknown"
    }).join(", ")
  }

  const hideCandidateVotes = election.description?.includes("<!--[HIDE_VOTES]-->") || false

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column - Progress Bars */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-slate-800">Perolehan Suara</h2>
            {hideCandidateVotes && (
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 flex items-center gap-1.5">
                <EyeOff size={14} /> Disembunyikan dari Mahasiswa
              </span>
            )}
          </div>
          
          <div className="space-y-6">
            {sortedItems.map((item, index) => {
              const voteCount = resultsData[item.id] || 0
              const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : "0.0"
              const widthPercentage = ((voteCount / maxVotes) * 100)
              const isWinner = index === 0 && voteCount > 0
              
              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      {isCandidateType && (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-700">{item.name}</h4>
                        {isCandidateType && <p className="text-xs text-slate-500">{item.nim}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg text-slate-800">{voteCount}</span>
                      <span className="text-xs text-slate-500 ml-1">suara ({percentage}%)</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar Container */}
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${isWinner ? 'bg-blue-500' : 'bg-slate-300'}`}
                      style={{ width: `${widthPercentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Right Column - Voter List */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck size={20} className="text-emerald-500" />
              Daftar Pemilih
            </h2>
            <button 
              onClick={() => setShowChoices(!showChoices)}
              className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 px-2 py-1 rounded-md"
              title="Tampilkan/Sembunyikan Pilihan Suara"
            >
              {showChoices ? <EyeOff size={14} /> : <Eye size={14} />} {showChoices ? 'Sembunyikan' : 'Lihat Pilihan'}
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari nama atau NIM..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {filteredVoters.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">
                Tidak ada data pemilih yang ditemukan.
              </div>
            ) : (
              filteredVoters.map((voter) => (
                <div key={voter.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-bold text-sm text-slate-800">{voter.name}</p>
                      <p className="text-xs text-slate-500">{voter.nim} • {voter.className}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                      {format(new Date(voter.votedAt), "HH:mm, dd MMM", { locale: id })}
                    </span>
                  </div>
                  {showChoices && (
                    <div className="mt-2 pt-2 border-t border-slate-100/50">
                      <p className="text-xs text-slate-600">
                        Memilih: <span className="font-semibold text-blue-700 bg-blue-50 px-1 rounded">{getChoiceNames(voter.details)}</span>
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div className="pt-4 mt-2 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">Menampilkan {filteredVoters.length} dari {voters.length} pemilih</p>
          </div>
        </div>
      </div>
    </div>
  )
}
