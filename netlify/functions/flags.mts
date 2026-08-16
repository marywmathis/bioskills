import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (token !== Netlify.env.get("EXPORT_TOKEN")) {
    return new Response("Forbidden", { status: 403 });
  }

  const store = getStore("bioskills-usage");
  const { blobs } = await store.list({ prefix: "devices/" });

  const byCode: Record<string, { deviceId: string; lastSeen: string | null }[]> = {};
  for (const b of blobs) {
    const rec = await store.get(b.key, { type: "json" }) as
      { code?: string; deviceId?: string; lastSeen?: string } | null;
    const parts = b.key.split("/");
    const code = String(rec?.code || parts[1] || "").toUpperCase();
    const deviceId = String(rec?.deviceId || parts.slice(2).join("/") || "");
    if (!code || !deviceId) continue;
    (byCode[code] ||= []).push({ deviceId, lastSeen: rec?.lastSeen ?? null });
  }

  const flagged = Object.entries(byCode)
    .map(([code, devices]) => ({ code, deviceCount: devices.length, devices }))
    .filter((x) => x.deviceCount >= 2)
    .sort((a, b) => b.deviceCount - a.deviceCount);

  const summary = {
    generatedAt: new Date().toISOString(),
    flaggedCount: flagged.length,
    note: "Each code below has been used from 2+ browsers. Device count reflects browsers, not people.",
    flagged
  };

  return new Response(JSON.stringify(summary, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=bioskills-flags.json"
    }
  });
};

export const config: Config = {
  path: "/api/flags"
};
