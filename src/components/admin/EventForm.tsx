"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createEvent, updateEvent } from "@/app/actions";
import type { EventRow } from "@/lib/types";
import { EVENT_CATEGORIES, toLocalDatetimeInput } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "cancelled", label: "Cancelled" },
  { value: "completed", label: "Completed" },
];

const inputClass =
  "w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-emerald-400 focus:outline-none";

const labelClass = "mb-1 block text-xs font-medium text-slate-400";

export function EventForm({
  mode,
  event,
}: {
  mode: "create" | "edit";
  event?: EventRow;
}) {
  const action = mode === "create" ? createEvent : updateEvent;
  const [state, formAction, pending] = useActionState(action, {});

  const isEdit = mode === "edit";

  return (
    <form action={formAction} className="space-y-6">
      {isEdit && event && (
        <input type="hidden" name="id" value={event.id} />
      )}

      {state.error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
          {state.error}
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Basics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Title *
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={event?.title}
              placeholder="e.g. Build with AI Bootcamp"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="tagline" className={labelClass}>
              Tagline
            </label>
            <input
              id="tagline"
              name="tagline"
              defaultValue={event?.tagline ?? ""}
              placeholder="One-line pitch"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="category" className={labelClass}>
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={event?.category ?? ""}
              className={inputClass}
            >
              <option value="">— Select —</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="organizer" className={labelClass}>
              Organizer
            </label>
            <input
              id="organizer"
              name="organizer"
              defaultValue={event?.organizer ?? "Huawei"}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={event?.status ?? "published"}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="slug" className={labelClass}>
              Slug <span className="text-slate-600">(for share link)</span>
            </label>
            <input
              id="slug"
              name="slug"
              defaultValue={event?.slug ?? ""}
              placeholder="auto-generated if blank"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="cover_image_url" className={labelClass}>
              Cover image URL
            </label>
            <input
              id="cover_image_url"
              name="cover_image_url"
              type="url"
              defaultValue={event?.cover_image_url ?? ""}
              placeholder="https://…"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          When & where
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="start_time" className={labelClass}>
              Start date & time *
            </label>
            <input
              id="start_time"
              name="start_time"
              type="datetime-local"
              required
              defaultValue={
                event ? toLocalDatetimeInput(event.start_time) : undefined
              }
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="end_time" className={labelClass}>
              End date & time
            </label>
            <input
              id="end_time"
              name="end_time"
              type="datetime-local"
              defaultValue={
                event?.end_time ? toLocalDatetimeInput(event.end_time) : undefined
              }
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="venue" className={labelClass}>
              Venue
            </label>
            <input
              id="venue"
              name="venue"
              defaultValue={event?.venue ?? ""}
              placeholder="e.g. Huawei Innovation Lab"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              name="city"
              defaultValue={event?.city ?? "Minna"}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="capacity" className={labelClass}>
              Capacity{" "}
              <span className="text-slate-600">(blank = unlimited)</span>
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={event?.capacity ?? ""}
              placeholder="e.g. 100"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="price" className={labelClass}>
              Price (₦)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={event?.price ?? 0}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Description
        </h2>
        <label htmlFor="description" className="sr-only">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          defaultValue={event?.description ?? ""}
          placeholder="Write the event details. Use blank lines to separate paragraphs."
          className={`${inputClass} resize-y`}
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          {isEdit ? "Save changes" : "Create event"}
        </button>
      </div>
    </form>
  );
}
