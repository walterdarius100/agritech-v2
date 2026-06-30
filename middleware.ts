import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_ACCESS_TOKEN_COOKIE } from "@/lib/auth/adminAuth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const accessToken = request.cookies.get(ADMIN_ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
