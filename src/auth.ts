import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        nim: { label: "NIM", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.nim || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { nim: credentials.nim as string },
        })

        if (!user || !user.isActive) {
          return null
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (passwordsMatch) {
          return {
            id: user.id,
            name: user.name,
            nim: user.nim,
            role: user.role,
            mustChangePassword: user.mustChangePassword,
          }
        }
        return null
      },
    }),
  ],
})
