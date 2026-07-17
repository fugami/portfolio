import { NextResponse, type NextRequest } from "next/server";

/**
 * Password gate for the admin area and the upload endpoint.
 *
 * A valid session is a cookie holding the SHA-256 hex of ADMIN_PASSWORD (set
 * by the /admin/login action). Rules:
 *  - ADMIN_PASSWORD unset in production → admin is disabled outright.
 *  - ADMIN_PASSWORD unset in development → open, preserving the local workflow.
 */

const SESSION_COOKIE = "admin_session";

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time string comparison. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page must stay reachable to break the redirect loop.
  if (pathname === "/admin/login") return NextResponse.next();

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    return new NextResponse(
      "Admin is disabled: set the ADMIN_PASSWORD environment variable.",
      { status: 503 }
    );
  }

  const expected = await sha256Hex(password);
  const session = req.cookies.get(SESSION_COOKIE)?.value ?? "";
  if (safeEqual(session, expected)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/upload"],
};
