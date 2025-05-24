import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Định nghĩa các route cần bảo vệ (yêu cầu đăng nhập)
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/dashboard(.*)',
  '/orders(.*)',
  '/admin(.*)',
]);

// Định nghĩa các route chỉ dành cho admin
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
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
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};