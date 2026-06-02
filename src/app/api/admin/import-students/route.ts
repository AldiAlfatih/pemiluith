import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { students, strategy, fileType } = await req.json()
    if (!Array.isArray(students)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 })
    }

    let totalImported = 0
    let totalUpdated = 0
    let totalSkipped = 0

    const importBatchId = `batch_${Date.now()}`
    const importSource = fileType === "csv" ? "csv_upload" : "excel_upload"

    for (const student of students) {
      if (!student.nim || !student.name) continue

      const existing = await prisma.user.findUnique({
        where: { nim: student.nim }
      })

      if (existing) {
        if (strategy === "skip") {
          totalSkipped++
          continue
        } else if (strategy === "update") {
          await prisma.user.update({
            where: { nim: student.nim },
            data: {
              name: student.name,
              email: student.email || existing.email,
              phoneNumber: student.phoneNumber,
              studentStatus: student.studentStatus,
              dataConsent: student.dataConsent,
              importSource,
              importBatchId,
            }
          })
          totalUpdated++
          continue
        }
      }

      // New student
      const passwordHash = await bcrypt.hash(student.nim, 10)
      
      await prisma.user.create({
        data: {
          nim: student.nim,
          name: student.name,
          email: student.email || undefined,
          phoneNumber: student.phoneNumber,
          studentStatus: student.studentStatus,
          dataConsent: student.dataConsent,
          passwordHash,
          role: "MAHASISWA",
          mustChangePassword: true,
          isActive: true,
          importSource,
          importBatchId,
        }
      })
      totalImported++
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "IMPORT_STUDENTS",
        description: `Imported: ${totalImported}, Updated: ${totalUpdated}, Skipped: ${totalSkipped} via ${fileType}`,
      }
    })

    return NextResponse.json({
      totalRead: students.length,
      totalImported,
      totalUpdated,
      totalSkipped,
    })
  } catch (error: any) {
    console.error("Import Error:", error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
