"use client"

import { useState, useEffect } from "react"

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
    
    if (localStorage.getItem('push-dismissed') === 'true') {
      setDismissed(true)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      const sub = await registration.pushManager.getSubscription()
      setSubscription(sub)
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const subscribeToPush = async () => {
    setIsSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert("Anda harus mengizinkan akses notifikasi di pengaturan browser Anda.")
        setIsSubscribing(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      
      if (!vapidPublicKey) {
         alert("Konfigurasi notifikasi tidak lengkap di server.")
         return
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })
      
      // Send to server
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      })

      if (!response.ok) {
        throw new Error("Gagal menyimpan ke server")
      }

      setSubscription(sub)
      alert("Notifikasi berhasil diaktifkan!")
    } catch (error: any) {
      console.error('Failed to subscribe:', error)
      alert("Terjadi kesalahan: " + error.message)
    } finally {
      setIsSubscribing(false)
    }
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem('push-dismissed', 'true')
  }

  if (!isSupported || subscription || dismissed) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0 mt-1">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Aktifkan Notifikasi</h4>
          <p className="text-sm text-blue-700 mt-0.5">Dapatkan pemberitahuan penting secara langsung jika ada pemilihan baru atau pengingat batas waktu.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button 
          onClick={dismiss}
          className="shrink-0 text-blue-600 hover:bg-blue-100 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
        >
          Nanti
        </button>
        <button 
          onClick={subscribeToPush}
          disabled={isSubscribing}
          className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors text-sm"
        >
          {isSubscribing ? "Mengaktifkan..." : "Aktifkan Sekarang"}
        </button>
      </div>
    </div>
  )
}
