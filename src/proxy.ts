import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/updateSession";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
