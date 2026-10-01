"use client";

import { useActionState, useState } from "react";
import { getMyRegistrations } from "@/app/actions";
import { formatDate, formatTime, getEventShortUrl } from "@/lib/utils";
import { Mail, Loader2, CalendarDays, Clock, MapPin, ExternalLink, TicketCheck, AlertTriangle, PartyPopper, Link2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FormState = {
  data: Awaited<ReturnType<typeof getMyRegistrations>>["data"] | null;
  error?: string | undefined;
};

export default function MyRegistrationsPage() {
  const [formState, formAction, pending] = useActionState(
    async (_prev: FormState, formData: FormData) => {
      const email = String(formData.get("email") ?? "");
      return getMyRegistrations(email);
    },
    { data: null, error: undefined }
  );

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">My Registrations</h1>
        <p className="mt-2 text-slate-400">
          Enter your email to view all your event registrations.
        </p>
      </div>

      <form action={formAction} className="mb-8">
        <div className="flex gap-2 max-w-md mx-auto">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            disabled={pending}
            className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Looking up…
              </>
            ) : (
              <>
                <Mail size={16} />
                Find Registrations
              </>
            )}
          </button>
        </div>
        {formState.error && (
          <p className="mt-3 text-center text-sm text-rose-300">{formState.error}</p>
        )}
      </form>

      {formState.data && formState.data.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Your Registrations ({formState.data.length})
          </h2>
          {formState.data.map((reg) => {
            const event = reg.event;
            const statusStyles: Record<string, string> = {
              confirmed: "bg-green-400/10 text-green-300",
              waitlisted: "bg-amber-400/10 text-amber-300",
              cancelled: "bg-rose-400/10 text-rose-300",
              checked_in: "bg-sky-400/10 text-sky-300",
            };
            const statusIcons: Record<string, React.ReactNode> = {
              confirmed: <TicketCheck size={13} />,
              waitlisted: <AlertTriangle size={13} />,
              cancelled: <X size={13} />,
              checked_in: <PartyPopper size={13} />,
            };

            return (
              <article
                key={reg.id}
                className="group rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden transition hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
                  className="w-full p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {event.cover_image_url && (
                      <div className="shrink-0 h-16 w-16 rounded-xl overflow-hidden bg-slate-800">
                        <img
                          src={event.cover_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate text-white">{event.title}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} className="text-emerald-400" />
                          {formatDate(event.start_time)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-emerald-400" />
                          {formatTime(event.start_time)}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-emerald-400" />
                            {event.venue}, {event.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium",
                        statusStyles[reg.status]
                      )}
                    >
                      {statusIcons[reg.status]}
                      {reg.status.charAt(0).toUpperCase() + reg.status.slice(1).replace("_", " ")}
                    </span>
                    <ExternalLink
                      size={18}
                      className="text-slate-400 transition group-hover:text-emerald-300"
                    />
                  </div>
                </button>

                {expandedId === reg.id && (
                  <div className="border-t border-white/10 px-5 pb-5">
                    <div className="mt-4 grid gap-3 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Link2 size={14} className="text-slate-500" />
                        <span className="font-mono text-slate-200">{reg.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail size={14} className="text-slate-500" />
                        <span>{reg.email}</span>
                      </div>
                      {reg.phone && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="w-5 text-slate-500">📞</span>
                          <span>{reg.phone}</span>
                        </div>
                      )}
                      {reg.matric_number && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="w-5 text-slate-500">#</span>
                          <span>Matric: {reg.matric_number}</span>
                        </div>
                      )}
                      {reg.department && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="w-5 text-slate-500">📚</span>
                          <span>{reg.department}</span>
                        </div>
                      )}
                      {reg.level && (
                        <div className="flex items-center gap-2 text-slate-300">
                          <span className="w-5 text-slate-500">🎓</span>
                          <span>Level {reg.level}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={getEventShortUrl(event.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                        >
                          <ExternalLink size={12} />
                          View Event
                        </a>
                        {event.official_registration_url && (
                          <a
                            href={event.official_registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            <ExternalLink size={12} />
                            Official Registration
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {formState.data && formState.data.length === 0 && !formState.error && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-400">
          No registrations found for this email.
        </div>
      )}
    </div>
  );
}