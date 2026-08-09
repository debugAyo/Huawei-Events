import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("slug, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!event || event.status !== "published") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Track the click (best effort — never fail the redirect on a tracking error).
  try {
    await supabase.rpc("increment_event_clicks", { p_slug: slug });
  } catch {
    // ignore
  }

  const target = new URL(`/events/${encodeURIComponent(slug)}`, request.url);
  return NextResponse.redirect(target, { status: 308 });
}
