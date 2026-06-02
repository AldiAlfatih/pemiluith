"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { id as idLocale } from "date-fns/locale"

type VoterInfo = {
  id: string
  createdAt: Date
  user: {
    name: string
    nim: string
    programStudy: string | null
  }
}

export default function RecentVotersTicker({ votes }: { votes: VoterInfo[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (votes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center h-[500px]">
        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <p className="text-gray-500 text-sm font-medium">Belum ada suara masuk.</p>
      </div>
    )
  }

  // Duplicate the list to make infinite scroll smooth
  const displayVotes = votes.length > 4 ? [...votes, ...votes] : votes
  const shouldAnimate = votes.length > 4

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[500px] overflow-hidden relative">
      <div className="p-5 border-b border-gray-100 bg-gray-50/80 z-20">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          Aktivitas Terkini
        </h3>
        <p className="text-xs text-gray-500 mt-1">Memantau pemilih secara realtime</p>
      </div>
      
      <div className="flex-1 overflow-hidden relative group">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideUp {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); } 
          }
          .animate-ticker {
            animation: slideUp ${Math.max(votes.length * 2, 10)}s linear infinite;
          }
          .animate-ticker:hover {
            animation-play-state: paused;
          }
        `}} />
        
        <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between">
          <div className="w-full h-12 bg-gradient-to-b from-white to-transparent"></div>
          <div className="w-full h-12 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        <div className={`flex flex-col ${shouldAnimate ? "animate-ticker" : "overflow-y-auto h-full"}`}>
          {displayVotes.map((vote, i) => (
            <div key={`${vote.id}-${i}`} className="p-4 border-b border-gray-50 hover:bg-blue-50/50 transition-colors flex items-start gap-3 bg-white">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200/50">
                {vote.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{vote.user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide">{vote.user.nim}</span>
                  {vote.user.programStudy && <span className="text-xs text-slate-500 truncate font-medium">{vote.user.programStudy}</span>}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDistanceToNow(new Date(vote.createdAt), { addSuffix: true, locale: idLocale })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
