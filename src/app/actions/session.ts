"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_MINUTES = 120;
const COOKIE = "admin_session_started_at";

function capMinutes(): number {
  const raw = process.env.ADMIN_SESSION_MINUTES;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MINUTES;
}

export async function markAdminSessionStart() {
  const store = await cookies();
  store.set(COOKIE, String(Date.now()), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: capMinutes() * 60,
  });
}

export async function adminSessionState(): Promise<"ok" | "expired"> {
  const store = await cookies();
  const started = store.get(COOKIE)?.value;
  if (!started) return "ok"; // no cap cookie yet; allow

  const start = Number.parseInt(started, 10);
  const elapsed = Date.now() - start;
  const limit = capMinutes() * 60 * 1000;
  return elapsed > limit ? "expired" : "ok";
}

export async function expireAdminSession() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const store = await cookies();
  store.delete(COOKIE);
  redirect("/admin/login?expired=1");
}
