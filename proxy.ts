import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    return session
      ? NextResponse.redirect(new URL("/today", request.url))
      : NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/today" : "/login", request.url),
    );
  }

  if (!session) return NextResponse.redirect(new URL("/login", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/today/:path*",
    "/inbox/:path*",
    "/week/:path*",
    "/projects/:path*",
    "/settings/:path*",
  ],
};
