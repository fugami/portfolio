"use server";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE = "admin_session";
const SESSION_DAYS = 30;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export async function loginAction(fd: FormData): Promise<void> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) redirect("/admin"); // middleware decides whether admin is open

  const attempt = typeof fd.get("password") === "string" ? (fd.get("password") as string) : "";
  const ok =
    attempt.length > 0 &&
    timingSafeEqual(
      Buffer.from(sha256Hex(attempt), "hex"),
      Buffer.from(sha256Hex(password), "hex")
    );

  if (!ok) redirect("/admin/login?error=1");

  (await cookies()).set(SESSION_COOKIE, sha256Hex(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect("/admin");
}
