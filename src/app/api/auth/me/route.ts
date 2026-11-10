import { currentSession, json, storageConfigured } from "@/lib/server/accounts";

export async function GET() {
  if (!storageConfigured()) return json({ email: null, available: false });
  try {
    const session = await currentSession();
    return json({ email: session?.email ?? null, available: true });
  } catch (e) {
    console.error("session check failed", e);
    return json({ error: "Could not check the session." }, 500);
  }
}
