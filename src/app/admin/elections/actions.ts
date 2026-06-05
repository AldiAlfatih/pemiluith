"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { ElectionType, ElectionMethod, ElectionStatus } from "@prisma/client"

export async function createElection(formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as ElectionType
  const method = formData.get("method") as ElectionMethod
  const minChoices = parseInt(formData.get("minChoices") as string) || 1
  const maxChoices = parseInt(formData.get("maxChoices") as string) || 1
  
  const isComingSoon = formData.get("isComingSoon") === "true" || formData.get("isComingSoon") === "on"
  
  let startAt: Date | null = null
  let endAt: Date | null = null

  if (formData.get("startAt")) {
    startAt = new Date(`${formData.get("startAt")}+08:00`)
  }
  if (formData.get("endAt")) {
    endAt = new Date(`${formData.get("endAt")}+08:00`)
  }

  if (!title || !type || !method) {
    throw new Error("Harap lengkapi field Judul, Tipe, dan Metode")
  }

  if (!isComingSoon && (!startAt || !endAt)) {
    throw new Error("Jadwal mulai dan selesai wajib diisi jika tidak menandai Coming Soon")
  }

  if (startAt && endAt && startAt >= endAt) {
    throw new Error("Waktu selesai harus setelah waktu mulai")
  }

  const election = await prisma.election.create({
    data: {
      title,
      description,
      type,
      method,
      minChoices,
      maxChoices,
      isComingSoon,
      startAt,
      endAt,
      status: "ACTIVE", // Or DRAFT depending on your workflow
      createdBy: session.user.id,
    }
  })

  revalidatePath("/admin/elections")
  return { success: true, id: election.id }
}

export async function updateElection(id: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const type = formData.get("type") as ElectionType
  const method = formData.get("method") as ElectionMethod
  const minChoices = parseInt(formData.get("minChoices") as string) || 1
  const maxChoices = parseInt(formData.get("maxChoices") as string) || 1
  
  const isComingSoon = formData.get("isComingSoon") === "true" || formData.get("isComingSoon") === "on"
  
  let startAt: Date | null = null
  let endAt: Date | null = null

  if (formData.get("startAt")) {
    startAt = new Date(`${formData.get("startAt")}+08:00`)
  }
  if (formData.get("endAt")) {
    endAt = new Date(`${formData.get("endAt")}+08:00`)
  }

  if (!title || !type || !method) {
    throw new Error("Harap lengkapi field Judul, Tipe, dan Metode")
  }

  if (!isComingSoon && (!startAt || !endAt)) {
    throw new Error("Jadwal mulai dan selesai wajib diisi jika tidak menandai Coming Soon")
  }

  if (startAt && endAt && startAt >= endAt) {
    throw new Error("Waktu selesai harus setelah waktu mulai")
  }

  await prisma.election.update({
    where: { id },
    data: {
      title,
      description,
      type,
      method,
      minChoices,
      maxChoices,
      isComingSoon,
      startAt,
      endAt,
    }
  })

  revalidatePath("/admin/elections")
  return { success: true, id }
}

export async function deleteElection(id: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  await prisma.election.delete({ where: { id } })
  revalidatePath("/admin/elections")
  return { success: true }
}

export async function closeElectionEarly(id: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  await prisma.election.update({
    where: { id },
    data: { status: "CLOSED", endAt: new Date() }
  })
  revalidatePath("/admin/elections")
  return { success: true }
}

export async function addCandidate(electionId: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const nim = formData.get("nim") as string
  const programStudy = formData.get("programStudy") as string
  const vision = formData.get("vision") as string
  const mission = formData.get("mission") as string
  const photoUrl = formData.get("photoUrl") as string
  const linkedinUrl = formData.get("linkedinUrl") as string
  const portfolioUrl = formData.get("portfolioUrl") as string
  const instagramUrl = formData.get("instagramUrl") as string

  if (!name || !nim || !programStudy) throw new Error("Nama, NIM, dan Prodi wajib diisi")

  await prisma.candidate.create({
    data: {
      electionId,
      name,
      nim,
      programStudy,
      vision,
      mission,
      photoUrl: photoUrl || null,
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: portfolioUrl || null,
      instagramUrl: instagramUrl || null,
    }
  })

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function addOption(electionId: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const philosophy = formData.get("philosophy") as string
  const meaning = formData.get("meaning") as string

  if (!name) throw new Error("Nama Opsi wajib diisi")

  await prisma.electionOption.create({
    data: {
      electionId,
      name,
      philosophy,
      meaning,
    }
  })

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function updateOption(id: string, electionId: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const philosophy = formData.get("philosophy") as string
  const meaning = formData.get("meaning") as string

  if (!name) throw new Error("Nama Opsi wajib diisi")

  await prisma.electionOption.update({
    where: { id },
    data: { name, philosophy, meaning }
  })

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function toggleOptionStatus(id: string, electionId: string, isActive: boolean) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  await prisma.electionOption.update({
    where: { id },
    data: { isActive }
  })

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function updateCandidate(id: string, electionId: string, formData: FormData) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const nim = formData.get("nim") as string
  const programStudy = formData.get("programStudy") as string
  const vision = formData.get("vision") as string
  const mission = formData.get("mission") as string
  const photoUrl = formData.get("photoUrl") as string
  const linkedinUrl = formData.get("linkedinUrl") as string
  const portfolioUrl = formData.get("portfolioUrl") as string
  const instagramUrl = formData.get("instagramUrl") as string

  if (!name || !nim || !programStudy) throw new Error("Nama, NIM, dan Prodi wajib diisi")

  await prisma.candidate.update({
    where: { id },
    data: { 
      name, 
      nim, 
      programStudy, 
      vision, 
      mission,
      photoUrl: photoUrl || null,
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: portfolioUrl || null,
      instagramUrl: instagramUrl || null,
    }
  })

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function toggleCandidateStatus(id: string, electionId: string, isActive: boolean) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  await prisma.candidate.update({
    where: { id },
    data: { isActive }
  })

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function deleteOption(id: string, electionId: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  try {
    await prisma.electionOption.delete({ where: { id } })
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw new Error("Tidak dapat menghapus opsi ini karena sudah ada suara yang masuk. Silakan gunakan fitur Nonaktifkan.")
    }
    throw error
  }

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}

export async function deleteCandidate(id: string, electionId: string) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized")

  try {
    await prisma.candidate.delete({ where: { id } })
  } catch (error: any) {
    if (error.code === 'P2003') {
      throw new Error("Tidak dapat menghapus kandidat ini karena sudah ada suara yang masuk. Silakan gunakan fitur Nonaktifkan.")
    }
    throw error
  }

  revalidatePath(`/admin/elections/${electionId}/manage`)
  return { success: true }
}
