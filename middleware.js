import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Public routes - allow access
  if (pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    // If logged in, redirect to appropriate dashboard
    if (session) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()

        if (profile?.role === 'student') {
          return NextResponse.redirect(new URL('/student/dashboard', req.url))
        } else if (profile?.role === 'recruiter') {
          return NextResponse.redirect(new URL('/recruiter/dashboard', req.url))
        } else if (profile?.role === 'tpo') {
          return NextResponse.redirect(new URL('/tpo/dashboard', req.url))
        }
      } catch (error) {
        // If profile doesn't exist, allow access to auth pages
        console.error('Error fetching profile:', error)
      }
    }
    return res
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based access control
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check role-based access
    if (pathname.startsWith('/student') && profile.role !== 'student') {
      return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, req.url))
    }

    if (pathname.startsWith('/recruiter') && profile.role !== 'recruiter') {
      return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, req.url))
    }

    if (pathname.startsWith('/tpo') && profile.role !== 'tpo') {
      return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, req.url))
    }
  } catch (error) {
    console.error('Error in middleware:', error)
    // On error, redirect to login
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

