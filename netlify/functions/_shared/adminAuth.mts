import { json } from "./store.mts";

const TOKEN_TTL_SECONDS = 12 * 60 * 60;

export async function loginAdmin(email: string, password: string): Promise<Response> {
  const configuredEmail = Netlify.env.get("ADMIN_EMAIL") || "";
  const configuredPassword = Netlify.env.get("ADMIN_PASSWORD") || "";

  if (!configuredEmail || !configuredPassword) {
    return json({ error: "Admin credentials are not configured." }, 500);
  }

  if (email.trim().toLowerCase() !== configuredEmail.trim().toLowerCase() || password !== configuredPassword) {
    return json({ error: "Invalid admin credentials." }, 403);
  }

  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const token = await signToken({ email: configuredEmail, exp });
  return json({ ok: true, email: configuredEmail, token, expiresAt: new Date(exp * 1000).toISOString() });
}

export async function requireAdmin(req: Request): Promise<{ ok: true; email: string } | Response> {
  const header = req.headers.get("authorization") || "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : req.headers.get("x-admin-token") || "";
  if (!token) return json({ error: "Admin token required." }, 401);

  const payload = await verifyToken(token);
  if (!payload) return json({ error: "Invalid or expired admin token." }, 403);
  return { ok: true, email: payload.email };
}

async function signToken(payload: { email: string; exp: number }): Promise<string> {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await hmac(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

async function verifyToken(token: string): Promise<{ email: string; exp: number } | null> {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  const expected = await hmac(encodedPayload);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload.email || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

async function hmac(message: string): Promise<string> {
  const secret = Netlify.env.get("ADMIN_TOKEN_SECRET") || Netlify.env.get("ADMIN_PASSWORD") || "";
  const importer = Function("moduleName", "return import(moduleName)") as (moduleName: string) => Promise<any>;
  const { createHmac } = await importer("node:crypto");
  return createHmac("sha256", secret).update(message).digest("base64url");
}

function base64UrlEncode(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + (4 - normalized.length % 4) % 4, "=");
  return atob(padded);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
