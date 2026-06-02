import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { newPassword } = await req.json()
    
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ message: "Password terlalu pendek" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        passwordHash,
        mustChangePassword: false 
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 })
  }
}
