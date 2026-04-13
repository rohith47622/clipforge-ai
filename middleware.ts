import { withAuth } from 'next-auth/middleware'
import { NextRequest } from 'next/server'

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    // This runs after NextAuth verifies the token
    return undefined
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

// Protect dashboard routes
export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*', '/api/videos/:path*', '/api/clips/:path*', '/api/billing/:path*', '/api/user/:path*'],
}
