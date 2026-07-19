import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const ADMIN_ROLES = ["ADMIN", "STAFF"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  if (pathname.startsWith("/admin")) {
    if (!session) return NextResponse.redirect(loginUrl);
    if (!ADMIN_ROLES.includes(session.role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/dealer")) {
    if (!session) return NextResponse.redirect(loginUrl);
    if (session.role !== "DEALER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!session) return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dealer/:path*", "/account/:path*"],
};
