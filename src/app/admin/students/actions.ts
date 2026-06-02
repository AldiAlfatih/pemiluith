"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcrypt"

export async function createStudent(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const nim = formData.get("nim") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const studentStatus = formData.get("studentStatus") as string

  if (!nim || !name) throw new Error("NIM dan Nama wajib diisi")

  // Check if nim already exists
  const existing = await prisma.user.findUnique({ where: { nim } })
  if (existing) throw new Error("Mahasiswa dengan NIM ini sudah terdaftar")

  // Default password is NIM
  const passwordHash = await bcrypt.hash(nim, 10)

  await prisma.user.create({
    data: {
      nim,
      name,
      email: email || null,
      phoneNumber: phoneNumber || null,
      studentStatus: studentStatus || null,
      passwordHash,
      role: "MAHASISWA",
      mustChangePassword: true, // force to change password
      importSource: "manual",
    }
  })

  revalidatePath("/admin/students")
  return { success: true }
}

export async function updateStudent(id: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const nim = formData.get("nim") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phoneNumber = formData.get("phoneNumber") as string
  const studentStatus = formData.get("studentStatus") as string
  const isActive = formData.get("isActive") === "true"

  if (!nim || !name) throw new Error("NIM dan Nama wajib diisi")

  // Check if nim changed and is already taken
  const existing = await prisma.user.findUnique({ where: { nim } })
  if (existing && existing.id !== id) throw new Error("NIM sudah digunakan oleh mahasiswa lain")

  await prisma.user.update({
    where: { id },
    data: {
      nim,
      name,
      email: email || null,
      phoneNumber: phoneNumber || null,
      studentStatus: studentStatus || null,
      isActive,
    }
  })

  revalidatePath("/admin/students")
  return { success: true }
}

export async function deleteStudent(id: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  await prisma.user.delete({ where: { id } })
  revalidatePath("/admin/students")
  return { success: true }
}

export async function resetPassword(id: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) throw new Error("User not found")

  // Reset password to NIM
  const passwordHash = await bcrypt.hash(user.nim, 10)

  await prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      mustChangePassword: true
    }
  })

  revalidatePath("/admin/students")
  return { success: true }
}
