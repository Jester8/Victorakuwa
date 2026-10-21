import "server-only";
import { scrypt, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

export const SESSION_COOKIE = "pv_admin";
const SESSION_DAYS = 14;
const DEFAULT_ADMIN_EMAIL = "vakuwa@gmail.com";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("SESSION_SECRET must be set to a random string of at least 32 characters.");
  }
  return value;
}

// Hash format: scrypt:<salt base64>:<key base64>. Colons rather than "$" because
// Next.js expands "$NAME" inside .env files. Generate with `npm run hash-password`.
async function verifyPassword(password: string, stored: string) {
  const [scheme, saltB64, keyB64] = stored.split(":");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await scryptAsync(password, Buffer.from(saltB64, "base64"), expected.length);
  return timingSafeEqual(actual, expected);
}

export async function checkCredentials(email: string, password: string) {
  const adminEmail = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
  const adminHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!adminHash) return false;
  // Always run the hash so a wrong email takes as long as a wrong password.
  const passwordOk = await verifyPassword(password, adminHash);
  return passwordOk && email.trim().toLowerCase() === adminEmail;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken() {
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) return false;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = token.slice(0, lastDot);
  const signature = Buffer.from(token.slice(lastDot + 1));
  const expected = Buffer.from(sign(payload));
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) {
    return false;
  }
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now();
}

export async function startSession() {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function isAdmin() {
  return isValidSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Call at the top of every admin page and server action. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
