import { NOT_CONFIGURED, createAccount, findAccount, json, normalizeEmail, readBody, sameOrigin, startSession, storageConfigured, validPassword } from "@/lib/server/accounts";

export async function POST(request: Request) {
  if (!storageConfigured()) return json({ error: NOT_CONFIGURED }, 503);
  if (!sameOrigin(request)) return json({ error: "Cross-site request refused." }, 403);
  const body = await readBody(request);
  const email = normalizeEmail(body?.email);
  if (!email) return json({ error: "Enter a valid email address." }, 400);
  if (!validPassword(body?.password)) return json({ error: "Use a password of at least 8 characters." }, 400);
  try {
    if (await findAccount(email)) return json({ error: "An account with that email already exists. Sign in instead." }, 409);
    await createAccount(email, body.password);
    await startSession(email);
    return json({ email });
  } catch (e) {
    console.error("signup failed", e);
    return json({ error: "Could not create the account. Try again in a moment." }, 500);
  }
}
