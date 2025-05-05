import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Check if the user is authenticated by looking for the isAuthenticated cookie
  const isAuthenticated = req.cookies.get('isAuthenticated')?.value === 'true'

  // If user is not signed in and the current path is not /login,
  // redirect the user to /login
  if (!isAuthenticated && req.nextUrl.pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and the current path is /login,
  // redirect the user to /dashboard
  if (isAuthenticated && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 