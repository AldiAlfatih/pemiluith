"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export default function ClientGuardian() {
  const [isBlurred, setIsBlurred] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Prevent keyboard shortcuts (Ctrl+C, Ctrl+S, Ctrl+P, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText("Screenshots are disabled for privacy.")
        setIsBlurred(true)
        setTimeout(() => setIsBlurred(false), 3000)
      }
      
      // Ctrl/Cmd shortcuts
      if ((e.ctrlKey || e.metaKey) && ["c", "s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
    }

    // Blur on focus loss (helps against Snipping Tool, Win+Shift+S)
    const handleBlur = () => {
      setIsBlurred(true)
    }

    const handleFocus = () => {
      setIsBlurred(false)
    }
    
    // Prevent dragging images
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    document.addEventListener("contextmenu", handleContextMenu)
    document.addEventListener("keydown", handleKeyDown)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("dragstart", handleDragStart)

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
      document.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("dragstart", handleDragStart)
    }
  }, [])

  return (
    <>
      {/* Dynamic Watermark to deter screenshots (Subtle but visible on screenshots) */}
      {session?.user && (
        <div className="fixed inset-0 z-[9998] pointer-events-none overflow-hidden opacity-[0.03] flex flex-wrap justify-center items-center mix-blend-difference select-none">
          {Array.from({ length: 150 }).map((_, i) => (
            <div key={i} className="transform -rotate-45 p-8 text-xl font-bold whitespace-nowrap text-black">
              {session.user.nim || session.user.name || 'E-VOTING'}
            </div>
          ))}
        </div>
      )}

      {/* The blur overlay */}
      {isBlurred && (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-md flex items-center justify-center select-none">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm text-center border border-slate-100">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              <div className="absolute w-16 h-16 border-4 border-red-500 rounded-full"></div>
              <div className="absolute w-16 h-[4px] bg-red-500 rotate-45"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Tangkapan Layar Dilarang</h3>
            <p className="text-sm text-slate-500">
              Demi menjaga kerahasiaan dan privasi pemilihan, aktivitas perekaman layar atau tangkapan layar tidak diperbolehkan.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
