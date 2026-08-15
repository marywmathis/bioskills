import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (token !== Netlify.env.get("EXPORT_TOKEN")) {
    return new Response("Forbidden", { status: 403 });
  }

  const store = getStore("bioskills-usage");
  const { blobs } = await store.list({ prefix: "events/" });

  const records: unknown[] = [];
  for (const b of blobs) {
    const rec = await store.get(b.key, { type: "json" });
    if (rec) records.push(rec);
  }

  return new Response(JSON.stringify(records), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=bioskills-events.json"
    }
  });
};

export const config: Config = {
  path: "/api/export"
};