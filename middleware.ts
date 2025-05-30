import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Định nghĩa các route cần bảo vệ (yêu cầu đăng nhập)
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/dashboard(.*)',
  '/checkout(.*)',
  '/admin(.*)',
]);

// Định nghĩa các route chỉ dành cho admin
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Định nghĩa các route PUBLIC cần được index
const isPublicRoute = createRouteMatcher([
  '/',
  '/books(.*)',
  
  '/blog(.*)',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
]);

export default clerkMiddleware(async (auth, req) => {
  // QUAN TRỌNG: Đối với public routes, không can thiệp gì cả
  if (isPublicRoute(req)) {
    const response = NextResponse.next();
    // Đảm bảo public routes được index
    response.headers.set('X-Robots-Tag', 'index, follow');
    return response;
  }
  
  // Bảo vệ các route được định nghĩa
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Bảo vệ admin routes với kiểm tra role
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    let role = null;
    
    if (sessionClaims?.role) {
      role = sessionClaims.role;
    }
    
    if (!role || role.toString().toUpperCase() !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  // CẬP NHẬT: Matcher chính xác hơn để tránh ảnh hưởng SEO
  matcher: [
    /*
     * Match tất cả request paths ngoại trừ:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static files (images, css, js, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    // API routes luôn cần middleware
    '/(api|trpc)(.*)',
  ],
};