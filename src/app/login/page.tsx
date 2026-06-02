"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [nim, setNim] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        nim,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError("NIM atau password salah")
      } else {
        router.push("/dashboard") // Middleware will redirect admins to /admin
        router.refresh()
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations matching landing page */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8 z-10 relative animate-in zoom-in-95 duration-500">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-24 h-24 mx-auto mb-4 transform -rotate-2 hover:rotate-2 transition-transform duration-300">
            <img src="/logo.png" alt="Logo ITH" className="w-full h-full object-contain drop-shadow-xl" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">E-Voting ITH</h1>
          <p className="text-slate-500 mt-2 font-medium">Silakan login untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">NIM / Username</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Memproses..." : "Masuk ke Portal"}
          </button>
        </form>
      </div>
    </div>
  )
}
