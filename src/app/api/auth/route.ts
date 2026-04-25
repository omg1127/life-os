export const dynamic = "force-dynamic";

import { createSessionToken, verifyPassword, COOKIE_NAME, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!password || !verifyPassword(password)) {
    return Response.json({ ok: false, error: "Wrong password" }, { status: 401 });
  }

  const token = createSessionToken();
  const cookie = sessionCookieOptions().replace("placeholder", token);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}

export async function DELETE() {
  const cookie = sessionCookieOptions(true);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
}
