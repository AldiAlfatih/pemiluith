"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function submitVote(electionId: string, selectedIds: string[]) {
  const session = await auth()
  if (!session || session.user.role !== "MAHASISWA") {
    throw new Error("Akses ditolak. Anda harus login sebagai mahasiswa.")
  }

  const userId = session.user.id

  // 1. Verify election exists and is active
  const election = await prisma.election.findUnique({
    where: { id: electionId }
  })

  if (!election) throw new Error("Pemilihan tidak ditemukan.")
  
  const now = new Date()
  if (now < election.startAt || now > election.endAt || election.status !== "ACTIVE") {
    throw new Error("Pemilihan ini sedang tidak aktif atau sudah ditutup.")
  }

  // 2. Verify user hasn't voted yet
  const existingVote = await prisma.vote.findUnique({
    where: {
      electionId_userId: { electionId, userId }
    }
  })

  if (existingVote) {
    throw new Error("Anda sudah memberikan suara pada pemilihan ini.")
  }

  // 3. Verify min/max choices logic
  if (selectedIds.length < election.minChoices) {
    throw new Error(`Anda harus memilih minimal ${election.minChoices} opsi/kandidat.`)
  }
  if (selectedIds.length > election.maxChoices) {
    throw new Error(`Anda maksimal hanya dapat memilih ${election.maxChoices} opsi/kandidat.`)
  }

  // 4. Submit Vote using Prisma Transaction
  const isCandidate = election.type === "KETUA_ANGKATAN"

  await prisma.$transaction(async (tx) => {
    // Create the main vote record
    const vote = await tx.vote.create({
      data: {
        electionId,
        userId,
      }
    })

    // Create the vote details (which specific candidates/options were chosen)
    const voteDetailsData = selectedIds.map(id => ({
      voteId: vote.id,
      candidateId: isCandidate ? id : null,
      optionId: !isCandidate ? id : null,
    }))

    await tx.voteDetail.createMany({
      data: voteDetailsData
    })
  })

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/vote/${electionId}`)
  revalidatePath(`/dashboard/results/${electionId}`)
  
  return { success: true }
}
