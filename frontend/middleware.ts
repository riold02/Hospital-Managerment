import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /dashboard/doctor)
  const path = request.nextUrl.pathname

  // Check if this is a dashboard route
  if (path.startsWith('/dashboard')) {
    // Allow access to login, register, and other auth routes
    if (path === '/dashboard' || path === '/dashboard/') {
      // For the main dashboard route, we need to check if user is admin
      // Since we can't access localStorage in middleware, we'll let the client-side redirect handle this
      return NextResponse.next()
    }

    // For role-specific dashboard routes like /dashboard/doctor, /dashboard/patient, etc.
    // Extract the role from the path
    const segments = path.split('/')
    if (segments.length >= 3 && segments[1] === 'dashboard') {
      const roleFromPath = segments[2].toLowerCase()
      
      // Allow access to role-specific dashboards
      // The actual role verification will be done on the client side
      return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match all dashboard routes
  matcher: ['/dashboard/:path*']
}