import { endSession, json, sameOrigin, storageConfigured } from "@/lib/server/accounts";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Cross-site request refused." }, 403);
  if (storageConfigured()) await endSession();
  return json({ ok: true });
}
