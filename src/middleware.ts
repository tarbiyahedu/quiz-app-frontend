import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the auth token from cookies or headers
  const authToken = request.cookies.get('authToken')?.value || 
                   request.headers.get('authorization')?.replace('Bearer ', '');

  // Admin-only routes
  const adminRoutes = [
    '/admin',
    '/api/admin',
    '/create-quiz'
  ];

  // Student-only routes (routes that should redirect admins to admin dashboard)
  const studentRoutes = [
    '/dashboard',
    '/profile',
    '/live-quiz',
    '/assignment-quiz',
    '/complete-quiz',
    '/result',
    '/settings'
  ];

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a student route
  const isStudentRoute = studentRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));

  if (isAdminRoute) {
    // If no auth token, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // For API routes, we'll let the backend handle role verification
    if (!pathname.startsWith('/api/')) {
      // For page routes, let client-side handle role checking
      return NextResponse.next();
    }
  }

  if (isStudentRoute) {
    // If no auth token, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // For page routes, let client-side handle role checking
    if (!pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};