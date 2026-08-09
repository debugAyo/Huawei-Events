import type { EventStatus, RegistrationStatus } from "@/lib/types";

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      url !== "https://your-project-ref.supabase.co" &&
      key !== "your-anon-key",
  );
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    "http://localhost:3000"
  );
}

export function getEventShortUrl(slug: string): string {
  return `${getSiteUrl()}/r/${slug}`;
}

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: "Africa/Lagos",
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
};

const TIME_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: "Africa/Lagos",
  hour: "numeric",
  minute: "2-digit",
};

export function formatDate(iso: string | null): string {
  if (!iso) return "TBA";
  try {
    return new Date(iso).toLocaleString("en-NG", DATE_OPTS);
  } catch {
    return "TBA";
  }
}

export function formatTime(iso: string | null): string {
  if (!iso) return "TBA";
  try {
    return new Date(iso).toLocaleString("en-NG", TIME_OPTS);
  } catch {
    return "TBA";
  }
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return "TBA";
  try {
    return new Date(iso).toLocaleString("en-NG", {
      ...DATE_OPTS,
      ...TIME_OPTS,
    });
  } catch {
    return "TBA";
  }
}

export function formatNaira(amount: number | null): string {
  if (!amount || amount <= 0) return "Free";
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}

export function toLocalDatetimeInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function generateSlug(title: string): string {
  const base = slugify(title) || "event";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Draft",
  published: "Published",
  cancelled: "Cancelled",
  completed: "Completed",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  confirmed: "Confirmed",
  waitlisted: "Waitlisted",
  cancelled: "Cancelled",
  checked_in: "Checked in",
};

export const EVENT_CATEGORIES = [
  "Bootcamp",
  "Hackathon",
  "Workshop",
  "Talk",
  "Meetup",
  "Competition",
  "Other",
] as const;
