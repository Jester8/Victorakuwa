// Usage: npm run hash-password -- "the admin password"
// Prints the value for ADMIN_PASSWORD_HASH (same format as src/lib/auth.ts).
import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 10) {
  console.error('Usage: npm run hash-password -- "a password of at least 10 characters"');
  process.exit(1);
}
const salt = randomBytes(16);
const key = scryptSync(password, salt, 64);
console.log(`scrypt:${salt.toString("base64")}:${key.toString("base64")}`);
