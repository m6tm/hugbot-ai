import {
	createCipheriv,
	createDecipheriv,
	randomBytes,
	scryptSync,
} from "node:crypto";
import { env } from "$env/dynamic/private";

// Ensure we have a key. In production this must be set.
// For dev we can fallback but it's better to enforce it or derive it.
// We'll trust the user has ENCRYPTION_KEY in .env, or we derive one from a fixed secret if missing for dev ease (not recommended for prod).
const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = env.ENCRYPTION_KEY || "default-dev-secret-key-change-me";
const IV_LENGTH = 16;

const key = scryptSync(SECRET_KEY, "salt", 32);

export function encrypt(text: string): string {
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);
	let encrypted = cipher.update(text, "utf8", "hex");
	encrypted += cipher.final("hex");
	// Return iv:encrypted
	return `${iv.toString("hex")}:${encrypted}`;
}

export function decrypt(text: string): string {
	const [ivPart, encryptedPart] = text.split(":");
	if (!ivPart || !encryptedPart) {
		throw new Error("Invalid text format");
	}

	const iv = Buffer.from(ivPart, "hex");
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	let decrypted = decipher.update(encryptedPart, "hex", "utf8");
	decrypted += decipher.final("utf8");
	return decrypted;
}
