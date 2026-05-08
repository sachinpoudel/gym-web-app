import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard", "/members"];

const decodeJwtPayload = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "="
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_token")?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    console.log(`Unauthorized access attempt to ${pathname}, redirecting to /login`);
    return NextResponse.redirect(loginUrl);
  }

  const payload = decodeJwtPayload(token);
  if (payload?.exp && Date.now() / 1000 >= payload.exp) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/members/:path*"],
};
