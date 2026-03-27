import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { MEMBER_COOKIE_NAME } from "@/lib/constants";

const publicPaths = ["/login", "/api/session/select-member"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return NextResponse.next();
  }

  const memberCookie = request.cookies.get(MEMBER_COOKIE_NAME)?.value;

  if (!memberCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

