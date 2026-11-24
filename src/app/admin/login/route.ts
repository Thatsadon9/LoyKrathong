import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_PATH,
  adminConfigured,
  cookieOptions,
  createSession,
  passwordMatches,
} from "@/lib/admin";

export async function POST(request: Request) {
  const back = (error?: string) =>
    NextResponse.redirect(new URL(error ? `${ADMIN_PATH}?error=${error}` : ADMIN_PATH, request.url), 303);

  if (!adminConfigured()) return back("config");

  const form = await request.formData().catch(() => null);
  const password = form?.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return back("password");
  }

  const session = createSession();
  const response = back();
  response.cookies.set(ADMIN_COOKIE, session.value, cookieOptions(request, session.maxAge));
  return response;
}
