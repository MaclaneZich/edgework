import { NOT_CONFIGURED, checkLogin, json, normalizeEmail, readBody, sameOrigin, startSession, storageConfigured } from "@/lib/server/accounts";

export async function POST(request: Request) {
  if (!storageConfigured()) return json({ error: NOT_CONFIGURED }, 503);
  if (!sameOrigin(request)) return json({ error: "Cross-site request refused." }, 403);
  const body = await readBody(request);
  const email = normalizeEmail(body?.email);
  const password = body?.password;
  if (!email || typeof password !== "string" || password.length === 0 || password.length > 200) {
    return json({ error: "Email or password is incorrect." }, 401);
  }
  try {
    const result = await checkLogin(email, password);
    if (!result.ok) {
      return result.reason === "locked"
        ? json({ error: "Too many wrong attempts. Wait ten minutes and try again." }, 429)
        : json({ error: "Email or password is incorrect." }, 401);
    }
    await startSession(email);
    return json({ email });
  } catch (e) {
    console.error("login failed", e);
    return json({ error: "Could not sign in. Try again in a moment." }, 500);
  }
}
