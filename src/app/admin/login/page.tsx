import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin sign in" };

export default async function AdminLoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-sm text-slate-400">
        Supabase is not configured. Set your environment variables and restart
        the server to enable the admin panel.
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");

  return <LoginForm />;
}
