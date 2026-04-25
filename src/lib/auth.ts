import { createHmac, timingSafeEqual } from "crypto";

const SECRET = process.env.AUTH_SECRET!;
const PASSWORD = process.env.AUTH_PASSWORD!;

export const COOKIE_NAME = "life-os-session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionToken(): string {
  const payload = `authenticated:${Date.now()}`;
  const sig = sign(payload);
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): boolean {
  const lastDot = token.lastIndexOf(".");
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const sig = token.slice(lastDot + 1);
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export function verifyPassword(input: string): boolean {
  const inputHash = createHmac("sha256", SECRET).update(input.trim()).digest();
  const passHash = createHmac("sha256", SECRET).update(PASSWORD.trim()).digest();
  return timingSafeEqual(inputHash, passHash);
}

export function sessionCookieOptions(clear = false): string {
  const parts = [
    `${COOKIE_NAME}=${clear ? "" : "placeholder"}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Secure",
    `Max-Age=${clear ? 0 : MAX_AGE}`,
  ];
  return parts.join("; ");
}
