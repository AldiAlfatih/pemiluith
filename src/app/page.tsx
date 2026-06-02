import Link from "next/link"
import { Vote } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 z-10 relative">
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transform -rotate-3 hover:rotate-3 transition-transform duration-300">
          <Vote className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
          E-Voting ITH
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
          Portal Pemilihan Elektronik Angkatan 1<br/>Institut Teknologi Bacharuddin Jusuf Habibie
        </p>
        
        <Link 
          href="/login" 
          className="inline-flex w-full items-center justify-center py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Masuk ke Portal
        </Link>
      </div>
      
      <p className="text-sm text-slate-400 mt-12 font-medium z-10 relative">
        © {new Date().getFullYear()} E-Voting ITH
      </p>
    </div>
  )
}
