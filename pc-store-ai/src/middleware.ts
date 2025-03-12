import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/jwt';

export async function middleware(request: NextRequest) {
  const protectedPaths = ['/my-account', '/cart', '/my-orders'];
  const isProtectedRoute = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      throw new Error('No token found');
    }

    verifyToken(token);
    
    const response = NextResponse.next();
    
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Authentication error:', error);

    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/my-account/:path*', '/cart/:path*', '/my-orders/:path*']
};
