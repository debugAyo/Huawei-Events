"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Loader2, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(searchParams.get("next") ?? "/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-slate-950">
            <Zap size={22} strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 text-xl font-bold">Admin sign in</h1>
          <p className="mt-1 text-sm text-slate-400">
            Huawei Events management panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6"
        >
          {searchParams.get("error") === "not_admin" && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
              Your account does not have admin access.
            </p>
          )}
          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-xs font-medium text-slate-400"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-xs font-medium text-slate-400"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
