import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    // Basic security check using Authorization header
    const authHeader = req.headers.get("authorization")
    
    // In production, always set WEBHOOK_SECRET in your .env file
    const expectedToken = process.env.WEBHOOK_SECRET || "ogitech-super-secret-2024"
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 })
    }

    const data = await req.json()
    
    // Expected payload from Google Apps Script
    // { "nim": "123", "name": "Budi", "email": "budi@ith.ac.id", "phone": "0812...", "programStudy": "Ilmu Komputer" }

    if (!data.nim || !data.name) {
      return NextResponse.json({ message: "Bad Request: NIM and Name are required" }, { status: 400 })
    }

    const nimString = String(data.nim).trim()
    
    // Check if student already exists
    const existingUser = await prisma.user.findUnique({
      where: { nim: nimString }
    })

    if (existingUser) {
      // Just update it if it exists
      const updated = await prisma.user.update({
        where: { nim: nimString },
        data: {
          name: data.name,
          email: data.email || existingUser.email,
          phoneNumber: data.phone || existingUser.phoneNumber,
          programStudy: data.programStudy || existingUser.programStudy,
          importSource: "google_form_webhook_update"
        }
      })
      return NextResponse.json({ message: "Student updated successfully", user: updated }, { status: 200 })
    }

    // Default password is their NIM
    const passwordHash = await bcrypt.hash(nimString, 10)

    const newUser = await prisma.user.create({
      data: {
        nim: nimString,
        name: data.name,
        email: data.email || undefined,
        phoneNumber: data.phone || null,
        programStudy: data.programStudy || null,
        passwordHash,
        role: "MAHASISWA",
        mustChangePassword: true, // Force them to change password on first login
        isActive: true,
        importSource: "google_form_webhook",
      }
    })

    return NextResponse.json({ message: "Student created successfully", user: newUser }, { status: 201 })
  } catch (error: any) {
    console.error("Webhook Error:", error)
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 })
  }
}
