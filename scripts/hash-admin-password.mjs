// Prints an admin password hash (same format as src/lib/admin-auth.ts) for INITIAL_ADMIN_PASSWORD_HASH.
// Usage: printf '%s' "the password" | node scripts/hash-admin-password.mjs
import { randomBytes, scryptSync } from 'node:crypto';

const chunks = [];
for await (const c of process.stdin) chunks.push(c);
const password = Buffer.concat(chunks).toString('utf8');
if (password.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
process.stdout.write(`scrypt$16384$${salt.toString('base64url')}$${hash.toString('base64url')}`);
