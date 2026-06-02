import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by \`auth\`, \`useSession\`, \`getSession\` and received as a prop on the \`SessionProvider\` React Context
   */
  interface Session {
    user: {
      id: string
      nim: string
      role: string
      mustChangePassword: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    nim: string
    role: string
    mustChangePassword: boolean
  }
}

declare module "next-auth/jwt" {
  /** Returned by the \`jwt\` callback and \`getToken\`, when using JWT sessions */
  interface JWT {
    id: string
    nim: string
    role: string
    mustChangePassword: boolean
  }
}
