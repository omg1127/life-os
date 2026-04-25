export const dynamic = "force-dynamic";

import { loadAppState, saveAppState } from "@/lib/notion";
import type { AppState } from "@/lib/notion";

export async function GET() {
  try {
    const state = await loadAppState();
    if (!state) {
      return Response.json({ ok: true, state: null });
    }
    return Response.json({ ok: true, state });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AppState;
    await saveAppState(body);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
