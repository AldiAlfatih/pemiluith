"use client"

import { useState, useEffect, useRef } from "react"
import { formatDistanceToNow, differenceInSeconds } from "date-fns"
import { id } from "date-fns/locale"
import confetti from "canvas-confetti"

export default function CountdownTimer({ targetDate, size = "sm" }: { targetDate: Date | string, size?: "sm" | "md" | "lg" }) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [diffSeconds, setDiffSeconds] = useState<number | null>(null)
  const [isEnded, setIsEnded] = useState(false)
  const hasFiredConfetti = useRef(false)

  const playBeep = (frequency = 800, duration = 150) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + (duration/1000));
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + (duration/1000));
    } catch (e) {}
  }

  const playTada = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playNote = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.00001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      }
      const now = audioCtx.currentTime;
      playNote(523.25, now, 0.4);       // C5
      playNote(659.25, now + 0.1, 0.4); // E5
      playNote(783.99, now + 0.2, 0.4); // G5
      playNote(1046.50, now + 0.3, 1.5); // C6
    } catch (e) {}
  }

  useEffect(() => {
    if (diffSeconds !== null) {
      if (diffSeconds > 0 && diffSeconds <= 10) {
        playBeep(800, 150); // Beep!
      } else if (diffSeconds === 0 && !hasFiredConfetti.current) {
        playTada(); // Festive sound!
      }
    }
  }, [diffSeconds])

  useEffect(() => {
    const target = new Date(targetDate)
    
    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = differenceInSeconds(target, now)

      if (diff <= 0) {
        setIsEnded(true)
        setTimeLeft("WAKTU HABIS")
        
        // Only fire confetti if the user actually watched it transition to 0
        setDiffSeconds((prevDiff) => {
          if (prevDiff !== null && prevDiff > 0 && !hasFiredConfetti.current) {
            hasFiredConfetti.current = true
            fireConfetti()
            
            // Reload the page automatically after confetti to lock the UI
            setTimeout(() => {
              window.location.reload()
            }, 5000)
          }
          return diff
        })
        return
      }

      setDiffSeconds(diff)

      if (diff <= 60) {
        setTimeLeft(`Tutup dalam ${diff} detik`)
      } else {
        const distance = formatDistanceToNow(target, { locale: id, addSuffix: true })
        setTimeLeft("Tutup " + distance)
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  const fireConfetti = () => {
    // Big initial burst
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.6 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
    });

    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 60 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff']
      });
    }, 200);
  }

  const sizeClasses = {
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }[size]

  if (diffSeconds === null) return <div className={`h-4 w-20 bg-slate-200 animate-pulse rounded ${sizeClasses}`}></div>

  const isEndingSoon = diffSeconds > 0 && diffSeconds <= 86400 // Less than 24h
  const isSuperUrgent = diffSeconds > 0 && diffSeconds <= 10 // Last 10 seconds

  if (isEnded) {
    return (
      <div className={`${sizeClasses} font-bold rounded-md bg-slate-800 text-white shadow-lg animate-bounce`}>
        🎉 WAKTU HABIS! 🎉
      </div>
    )
  }

  return (
    <div className={`${sizeClasses} font-bold rounded-md flex items-center gap-1.5 shadow-sm border transition-all duration-300 ${
      isSuperUrgent
        ? "bg-red-600 text-white border-red-700 animate-bounce scale-110 shadow-red-500/50" 
        : isEndingSoon 
          ? "bg-red-50 text-red-600 border-red-100 animate-pulse" 
          : "bg-indigo-50 text-indigo-600 border-indigo-100"
    }`}>
      {isSuperUrgent ? (
         <span className="text-lg animate-ping absolute opacity-20">{diffSeconds}</span>
      ) : (
        <svg className={size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
      <span className="relative z-10">{timeLeft}</span>
    </div>
  )
}
