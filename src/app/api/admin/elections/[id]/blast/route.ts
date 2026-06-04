import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import webpush from "web-push"
import { Resend } from "resend"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { method, customMessage } = await req.json()
    
    if (!["push", "email", "wa"].includes(method)) {
      return NextResponse.json({ error: "Invalid method" }, { status: 400 })
    }

    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        votes: { select: { userId: true } }
      }
    })

    if (!election) {
      return NextResponse.json({ error: "Election not found" }, { status: 404 })
    }

    const votedUserIds = election.votes.map(v => v.userId)

    const unvotedUsers = await prisma.user.findMany({
      where: {
        role: "MAHASISWA",
        id: { notIn: votedUserIds },
        isActive: true
      },
      include: {
        pushSubscriptions: true
      }
    })

    if (unvotedUsers.length === 0) {
      return NextResponse.json({ message: "Semua mahasiswa sudah memilih!" })
    }

    const defaultMsg = `Halo! Pemilihan "${election.title}" akan segera ditutup. Ayo segera berikan suaramu di portal e-voting sekarang!`
    const messageBody = customMessage || defaultMsg

    let successCount = 0
    let failureCount = 0

    if (method === "push") {
      const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      const vapidPrivate = process.env.VAPID_PRIVATE_KEY
      
      if (!vapidPublic || !vapidPrivate) {
        return NextResponse.json({ error: "VAPID Keys belum dikonfigurasi" }, { status: 400 })
      }

      webpush.setVapidDetails(
        'mailto:admin@pemiluith.my.id',
        vapidPublic,
        vapidPrivate
      )

      const payload = JSON.stringify({
        title: "PENGINGAT PEMILIHAN",
        body: messageBody,
        url: `/dashboard/vote/${election.id}`
      })

      const allSubs = unvotedUsers.flatMap(u => u.pushSubscriptions)
      
      const pushPromises = allSubs.map(sub => 
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { auth: sub.auth, p256dh: sub.p256dh }
          },
          payload
        ).then(() => { successCount++ }).catch(e => {
          console.error("Push failed for endpoint", sub.endpoint, e)
          failureCount++
          if (e.statusCode === 410) {
             // Subscription expired or unsubscribed, delete it
             prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(console.error)
          }
        })
      )
      
      await Promise.allSettled(pushPromises)

    } else if (method === "email") {
      const resendApiKey = process.env.RESEND_API_KEY
      if (!resendApiKey) {
        return NextResponse.json({ error: "RESEND_API_KEY belum diatur di Vercel" }, { status: 400 })
      }
      
      const resend = new Resend(resendApiKey)
      const validEmails = unvotedUsers.map(u => u.email).filter(Boolean) as string[]

      if (validEmails.length > 0) {
        try {
          await resend.emails.send({
            from: 'E-Voting ITH <no-reply@pemiluith.my.id>', // Make sure this domain is verified in Resend!
            to: validEmails,
            subject: `Pengingat: ${election.title}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">Pengingat Pemilihan</h2>
                <p>Halo Mahasiswa ITH,</p>
                <p>${messageBody}</p>
                <a href="https://pemiluith.my.id/dashboard/vote/${election.id}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Buka Portal Voting</a>
                <p style="margin-top: 30px; font-size: 12px; color: #666;">Jika Anda sudah memilih, abaikan email ini.</p>
              </div>
            `
          })
          successCount = validEmails.length
        } catch (e: any) {
          console.error("Resend error:", e)
          return NextResponse.json({ error: "Gagal mengirim email: " + e.message }, { status: 500 })
        }
      }

    } else if (method === "wa") {
      const fonnteToken = process.env.FONNTE_TOKEN
      if (!fonnteToken) {
         return NextResponse.json({ error: "FONNTE_TOKEN belum diatur di Vercel" }, { status: 400 })
      }

      const validPhones = unvotedUsers.map(u => u.phoneNumber).filter(Boolean) as string[]
      
      if (validPhones.length > 0) {
        const targetString = validPhones.join(",")
        
        try {
          const res = await fetch("https://api.fonnte.com/send", {
            method: "POST",
            headers: {
              "Authorization": fonnteToken
            },
            body: new URLSearchParams({
              target: targetString,
              message: messageBody + `\n\nLink Voting: https://pemiluith.my.id/dashboard/vote/${election.id}`,
            })
          })
          
          const result = await res.json()
          if (result.status) {
             successCount = validPhones.length
          } else {
             return NextResponse.json({ error: "Gagal dari Fonnte: " + result.reason }, { status: 500 })
          }
        } catch (error: any) {
           console.error("Fonnte error", error)
           return NextResponse.json({ error: "Gagal koneksi ke API Fonnte" }, { status: 500 })
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Blast dikirim. Berhasil kirim ke ${successCount} target.` 
    })

  } catch (error: any) {
    console.error("Blast API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
