"use client";

import { useActionState } from "react";
import {
  CalendarCheck,
  Loader2,
  PartyPopper,
  AlertTriangle,
  Ticket,
  Link2,
} from "lucide-react";
import { registerForEvent } from "@/app/actions";
import { cn } from "@/lib/utils";

export function RegistrationForm({
  eventId,
  isPast,
  shortUrl,
}: {
  eventId: string;
  isPast: boolean;
  shortUrl: string;
}) {
  const [state, action, pending] = useActionState(registerForEvent, {});

  if (isPast) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-white/5 p-4 text-sm text-slate-400">
        <CalendarCheck size={18} className="mt-0.5 shrink-0 text-slate-500" />
        Registration for this event has closed.
      </p>
    );
  }

  if (state.success) {
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
          {state.status === "waitlisted" ? (
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-300" />
          ) : (
            <PartyPopper size={20} className="mt-0.5 shrink-0 text-emerald-300" />
          )}
          <div className="text-sm">
            <p className="font-semibold text-emerald-200">
              {state.status === "waitlisted"
                ? "You're on the waitlist"
                : "You're registered!"}
            </p>
            {state.status === "waitlisted" ? (
              <p className="mt-1 text-slate-300">
                You are position <strong>#{state.waitlist_position}</strong>. We
                will email you at{" "}
                <strong className="break-all">{state.email}</strong> if a spot
                opens up.
              </p>
            ) : (
              <p className="mt-1 text-slate-300">
                A confirmation was sent to{" "}
                <strong className="break-all">{state.email}</strong>. See you
                there!
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-white/15 bg-slate-950 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 uppercase tracking-wide">
              <Ticket size={13} /> Confirmation
            </span>
            <span className="font-mono uppercase text-emerald-300">
              {state.status === "waitlisted" ? "WL" : "OK"}
            </span>
          </div>
          <div className="mt-2 font-mono text-sm text-slate-200">
            {state.registration_id}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Link2 size={13} />
            <span className="truncate">{shortUrl}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </p>
      )}

      <input type="hidden" name="eventId" value={eventId} />

      <div>
        <label htmlFor="full_name" className="mb-1 block text-xs font-medium text-slate-400">
          Full name *
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          minLength={2}
          placeholder="e.g. Aisha Bello"
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-400">
          Email *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-xs font-medium text-slate-400">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. 0801 234 5678"
          className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="matric_number" className="mb-1 block text-xs font-medium text-slate-400">
            Matric no.
          </label>
          <input
            id="matric_number"
            name="matric_number"
            placeholder="e.g. 2022/12345"
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="department" className="mb-1 block text-xs font-medium text-slate-400">
            Department
          </label>
          <input
            id="department"
            name="department"
            placeholder="e.g. Computer Eng."
            className="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="mb-1 block text-xs font-medium text-slate-400">
          Anything we should know?
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Dietary needs, questions, etc."
          className="w-full resize-none rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition",
          "hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        {pending ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Registering…
          </>
        ) : (
          "Register for this event"
        )}
      </button>
    </form>
  );
}
