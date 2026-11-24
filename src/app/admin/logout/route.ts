import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_PATH, cookieOptions } from "@/lib/admin";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL(ADMIN_PATH, request.url), 303);
  response.cookies.set(ADMIN_COOKIE, "", cookieOptions(request, 0));
  return response;
}
