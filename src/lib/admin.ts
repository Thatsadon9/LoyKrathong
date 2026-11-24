import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "lk_admin";
export const ADMIN_PATH = "/admin";
const SESSION_SECONDS = 12 * 60 * 60;
const MIN_PASSWORD_LENGTH = 12;

/** The admin password, or null when it is missing or too short to be safe. */
function adminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length >= MIN_PASSWORD_LENGTH ? value : null;
}

export function adminConfigured(): boolean {
  return adminPassword() !== null;
}

function sha256(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Sessions are signed with a key derived from the password, so changing it signs everyone out. */
function sign(payload: string, password: string): string {
  const key = sha256(`loykrathong-admin-session:${password}`);
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export function passwordMatches(input: string): boolean {
  const password = adminPassword();
  if (!password) return false;
  return timingSafeEqual(sha256(input), sha256(password));
}

export function createSession(): { value: string; maxAge: number } {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD is not set");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = `admin.${expires}`;
  return { value: `${payload}.${sign(payload, password)}`, maxAge: SESSION_SECONDS };
}

export function sessionIsValid(value: string | undefined): boolean {
  const password = adminPassword();
  if (!password || !value) return false;
  const lastDot = value.lastIndexOf(".");
  if (lastDot < 0) return false;
  const payload = value.slice(0, lastDot);
  const signature = Buffer.from(value.slice(lastDot + 1));
  const expected = Buffer.from(sign(payload, password));
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return false;
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now() / 1000;
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return sessionIsValid(store.get(ADMIN_COOKIE)?.value);
}

export function cookieOptions(request: Request, maxAge: number) {
  return {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "strict" as const,
    path: ADMIN_PATH,
    maxAge,
  };
}
