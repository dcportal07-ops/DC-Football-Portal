import { clerkMiddleware,createRouteMatcher } from '@clerk/nextjs/server';
import { roleAccessMap } from './lib/settings';
import { NextResponse } from 'next/server';



const matchers=Object.keys(roleAccessMap).map(route=>({
  matcher:createRouteMatcher([route]),
  allowedRoles:roleAccessMap[route]
}))

// const isProtectedRoute = createRouteMatcher(['/admin', '/coach'])

export default clerkMiddleware(async (auth, req) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(role!)) {
      const destination = role ? `/${role}` : '/';
      return NextResponse.redirect(new URL(destination, req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};