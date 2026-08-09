import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { getEventShortUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("slug, status")
    .eq("slug", slug)
    .maybeSingle();

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const buffer = await QRCode.toBuffer(getEventShortUrl(event.slug), {
    width: 512,
    margin: 2,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${event.slug}-qr.png"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
