import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

export const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const user = req.auth?.user
  
  // Public routes
  if (nextUrl.pathname === "/" || nextUrl.pathname === "/login") {
    if (isLoggedIn) {
      if (user?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin", nextUrl))
      }
      return NextResponse.redirect(new URL("/dashboard", nextUrl))
    }
    return NextResponse.next()
  }

  // Protected routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Force password change check
  if (user?.mustChangePassword && nextUrl.pathname !== "/force-change-password") {
    // Only allow API routes and the force-change-password page
    if (!nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/force-change-password", nextUrl))
    }
  }

  // Role guards
  if (nextUrl.pathname.startsWith("/admin") && user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  if (nextUrl.pathname.startsWith("/dashboard") && user?.role === "ADMIN") {
    return NextResponse.redirect(new URL("/admin", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
