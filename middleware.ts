// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Este es el guardián de tu aplicación.
// Se ejecuta antes de que se renderice cualquier página.
export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")
  const { pathname } = request.nextUrl

  // Si el usuario intenta acceder a cualquier página que no sea /login
  // y no tiene una cookie de sesión, lo redirigimos a /login.
  if (!sessionCookie && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Si el usuario tiene una sesión y trata de ir a /login,
  // lo redirigimos al dashboard.
  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// El 'matcher' define qué rutas estarán protegidas por el middleware.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
