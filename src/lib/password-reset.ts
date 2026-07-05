import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32;
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function createPasswordResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + EXPIRY_MS);
  return { token, tokenHash, expiresAt };
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetUrl(token: string): string {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
}
