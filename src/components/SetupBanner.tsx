import { Info, ExternalLink } from "lucide-react";

export function SetupBanner() {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6">
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 shrink-0 text-amber-400" size={22} />
        <div className="space-y-3 text-sm text-amber-100/90">
          <div>
            <p className="font-semibold text-amber-200">
              Supabase is not configured yet
            </p>
            <p className="mt-1 leading-relaxed">
              This app needs a Supabase project to store events and
              registrations. To finish setup:
            </p>
          </div>
          <ol className="list-decimal space-y-1 pl-5 leading-relaxed">
            <li>
              Create a free project at{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-emerald-300 hover:underline"
              >
                supabase.com <ExternalLink size={12} />
              </a>
            </li>
            <li>
              Run <code className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-xs">supabase/schema.sql</code> and{" "}
              <code className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-xs">supabase/seed.sql</code> in the SQL editor.
            </li>
            <li>
              Copy your project URL and anon key into{" "}
              <code className="rounded bg-amber-400/10 px-1.5 py-0.5 font-mono text-xs">.env.local</code>.
            </li>
            <li>Restart the dev server.</li>
          </ol>
          <p className="text-xs text-amber-200/70">
            Full instructions are in the README.
          </p>
        </div>
      </div>
    </div>
  );
}
