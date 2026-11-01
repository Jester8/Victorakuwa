// Usage: npm run check-password -- 'the admin password'
// Says whether the password matches ADMIN_PASSWORD_HASH in .env.local (or the
// environment), using the same check as src/lib/auth.ts. Nothing is printed
// about the password or the hash themselves.
import { readFileSync } from "node:fs";
import { scryptSync, timingSafeEqual } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run check-password -- 'the admin password'");
  process.exit(1);
}

let stored = process.env.ADMIN_PASSWORD_HASH;
if (!stored) {
  try {
    const line = readFileSync(".env.local", "utf8")
      .split("\n")
      .find((l) => l.startsWith("ADMIN_PASSWORD_HASH="));
    stored = line?.slice("ADMIN_PASSWORD_HASH=".length).trim().replace(/^["']|["']$/g, "");
  } catch {
    // No .env.local — handled below.
  }
}
if (!stored) {
  console.error("No ADMIN_PASSWORD_HASH found in .env.local or the environment.");
  process.exit(1);
}

const [scheme, saltB64, keyB64] = stored.split(":");
if (scheme !== "scrypt" || !saltB64 || !keyB64) {
  console.error("ADMIN_PASSWORD_HASH isn't in the scrypt:<salt>:<key> format. Generate it again with npm run hash-password.");
  process.exit(1);
}
const expected = Buffer.from(keyB64, "base64");
const actual = scryptSync(password, Buffer.from(saltB64, "base64"), expected.length);
if (timingSafeEqual(actual, expected)) {
  console.log("✓ That password matches ADMIN_PASSWORD_HASH.");
} else {
  console.log("✗ That password does NOT match ADMIN_PASSWORD_HASH.");
  process.exit(2);
}
