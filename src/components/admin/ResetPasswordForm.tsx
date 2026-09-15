"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getSession().then(({ data }) => {
      setRecoveryReady(Boolean(data.session));
    });
  }, []);

  async function sendResetLink(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
    const { error: resetError } = await createClient().auth.resetPasswordForEmail(
      email,
      { redirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback?next=/admin/reset-password` },
    );
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  async function updatePassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const { error: updateError } = await createClient().auth.updateUser({
      password,
    });
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setUpdated(true);
  }

  const recoveryLink = recoveryReady || (typeof window !== "undefined" && window.location.hash.includes("access_token"));

  if (updated) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 text-center">
        <h1 className="text-xl font-bold">Password updated</h1>
        <a className="mt-4 inline-block text-sm text-emerald-300" href="/admin/login">
          Return to admin sign in
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 py-20">
      <h1 className="text-center text-xl font-bold">{recoveryLink ? "Choose a new password" : "Reset your password"}</h1>
      <p className="mt-1 text-center text-sm text-slate-400">
        {recoveryLink ? "Enter a new password for your admin account." : "We will email you a secure reset link."}
      </p>
      <form onSubmit={recoveryLink ? updatePassword : sendResetLink} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        {error && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}
        {sent && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Check your email for the reset link.</p>}
        {!recoveryLink && !sent && (
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
        )}
        {recoveryLink && (
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white focus:border-emerald-400 focus:outline-none"
          />
        )}
        {!sent && <button className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400">{recoveryLink ? "Update password" : "Send reset link"}</button>}
      </form>
    </div>
  );
}