import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/pos/login")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/pos")) {
    const session = request.cookies.get("pos_session")?.value;
    const expected = process.env.POS_SESSION_SECRET;
    if (!expected || !session || session !== expected) {
      return NextResponse.redirect(new URL("/pos/login", request.url));
    }
  }

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session")?.value;
    const expected = process.env.ADMIN_SESSION_SECRET;
    if (!expected || !session || session !== expected) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pos/:path*", "/admin/:path*"],
};
