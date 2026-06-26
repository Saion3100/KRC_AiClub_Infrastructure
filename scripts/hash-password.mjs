import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const password = process.argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const scryptAsync = promisify(scrypt);
const salt = randomBytes(16).toString("base64url");
const key = await scryptAsync(password, salt, 64);

console.log(`scrypt$16384$8$1$${salt}$${key.toString("base64url")}`);
