import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "life-os-session";
const PUBLIC_PATHS = ["/login", "/api/auth", "/sw.js", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/favicon.ico"];

async function hmacVerify(token: string, secret: string): Promise<boolean> {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signed = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expected = Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, "0")).join("");
  if (sig.length !== expected.length) return false;
  let match = true;
  for (let i = 0; i < sig.length; i++) {
    match = match && sig[i] === expected[i];
  }
  return match;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const session = request.cookies.get(COOKIE_NAME)?.value;
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const valid = await hmacVerify(session, secret);
  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
