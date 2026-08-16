import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { code?: string; deviceId?: string; module?: string; event?: string; detail?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const code = String(body.code || "").trim().toUpperCase();
  const deviceId = String(body.deviceId || "").trim();
  const module = String(body.module || "").trim();
  const event = String(body.event || "").trim();

  if (!/^[A-Z0-9-]{3,30}$/.test(code)) return new Response("Bad code", { status: 400 });
  if (!module || !event) return new Response("Missing fields", { status: 400 });

  const ts = new Date().toISOString();
  const record = { code, deviceId: deviceId || null, module, event, ts, detail: body.detail ?? null };

  const store = getStore("bioskills-usage");

  const key = `events/${code}/${ts.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 8)}`;
  await store.setJSON(key, record);

  if (/^[A-Za-z0-9-]{6,64}$/.test(deviceId)) {
    await store.setJSON(`devices/${code}/${deviceId}`, { code, deviceId, lastSeen: ts });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" }
  });
};

export const config: Config = {
  path: "/api/log"
};
