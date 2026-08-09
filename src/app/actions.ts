"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import {
  generateSlug,
  slugify,
} from "@/lib/utils";
import type { RegistrationStatus } from "@/lib/types";
import {
  validateEventForm,
  validateRegistrationInput,
} from "@/lib/validation";
import { createRateLimiter } from "@/lib/rateLimit";
import {
  isEmailConfigured,
  sendAttendeeConfirmation,
  sendAdminNewRegistration,
  type RegistrationEmailData,
} from "@/lib/email";
import { formatDate, formatTime, getEventShortUrl } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Public registration
// ---------------------------------------------------------------------------

export interface RegisterState {
  error?: string | null;
  success?: boolean;
  status?: RegistrationStatus;
  waitlist_position?: number;
  registration_id?: string;
  email?: string;
}

const registrationLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60_000,
});

export async function registerForEvent(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const eventId = String(formData.get("eventId") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const matricNumber = String(formData.get("matric_number") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const level = String(formData.get("level") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const validationError = validateRegistrationInput({
    eventId,
    fullName,
    email,
  });

  if (validationError) {
    return { error: validationError };
  }

  const clientKey = `registration:${email || eventId}`;
  if (!registrationLimiter({ key: clientKey })) {
    return { error: "Too many registration attempts. Please try again in a minute." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_full_name: fullName,
    p_email: email,
    p_phone: phone || null,
    p_matric_number: matricNumber || null,
    p_department: department || null,
    p_level: level || null,
    p_notes: notes || null,
  });

  if (error) {
    if (error.message.includes("ALREADY_REGISTERED")) {
      return { error: "This email is already registered for this event." };
    }
    if (error.message.includes("EVENT_NOT_FOUND")) {
      return { error: "This event could not be found." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  if (isEmailConfigured) {
    void notifyRegistration(eventId, {
      fullName,
      email,
      registrationId: data.registration_id as string,
      status: data.status as RegistrationStatus,
      waitlist_position: data.waitlist_position as number,
    });
  }

  return {
    success: true,
    status: data.status as RegistrationStatus,
    waitlist_position: data.waitlist_position as number,
    registration_id: data.registration_id as string,
    email,
  };
}

async function notifyRegistration(
  eventId: string,
  info: {
    fullName: string;
    email: string;
    registrationId: string;
    status: RegistrationStatus;
    waitlist_position: number;
  },
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: event } = await supabase
      .from("events")
      .select("title, start_time, venue, city, slug")
      .eq("id", eventId)
      .maybeSingle();
    if (!event) return;

    const emailData: RegistrationEmailData = {
      eventTitle: event.title,
      eventDate: formatDate(event.start_time),
      eventTime: formatTime(event.start_time),
      venue: event.venue ?? "TBA",
      city: event.city ?? "",
      registrationId: info.registrationId,
      fullName: info.fullName,
      email: info.email,
      status: info.status,
      waitlistPosition: info.waitlist_position,
      eventUrl: getEventShortUrl(event.slug),
    };

    await sendAttendeeConfirmation(info.email, emailData);

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await sendAdminNewRegistration(adminEmail, emailData);
    }
  } catch (err) {
    console.error("[email] failed to notify", err);
  }
}

// ---------------------------------------------------------------------------
// Admin — event CRUD
// ---------------------------------------------------------------------------

interface EventFormState {
  error?: string | null;
}

function parseEventForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const startRaw = String(formData.get("start_time") ?? "");
  const endRaw = String(formData.get("end_time") ?? "");

  return {
    title,
    slug: slugInput ? slugify(slugInput) : "",
    tagline: String(formData.get("tagline") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    venue: String(formData.get("venue") ?? "").trim() || null,
    city: String(formData.get("city") ?? "Minna").trim() || "Minna",
    start_time: startRaw ? new Date(startRaw).toISOString() : null,
    end_time: endRaw ? new Date(endRaw).toISOString() : null,
    capacity: parseNullableInt(formData.get("capacity")),
    price: parseFloat(String(formData.get("price") ?? "0")) || 0,
    cover_image_url:
      String(formData.get("cover_image_url") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? "published"),
    organizer:
      String(formData.get("organizer") ?? "").trim() ||
      "Huawei",
  };
}

function parseNullableInt(value: FormDataEntryValue | null): number | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function createEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { supabase } = await requireAdmin();
  const parsed = parseEventForm(formData);

  const validationError = validateEventForm(parsed);
  if (validationError) return { error: validationError };

  const slug = parsed.slug || generateSlug(parsed.title);

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    return {
      error:
        "That slug is already taken. Leave the slug blank to auto-generate a unique one.",
    };
  }

  const { data, error } = await supabase
    .from("events")
    .insert({ ...parsed, slug })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(`/admin/events/${data.id}/edit`);
}

export async function updateEvent(
  _prevState: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing event id." };

  const parsed = parseEventForm(formData);
  const validationError = validateEventForm(parsed);
  if (validationError) return { error: validationError };

  // Keep the existing slug when none is provided, so share links stay stable.
  const { data: current } = await supabase
    .from("events")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const slug = parsed.slug || current?.slug || generateSlug(parsed.title);

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("slug", slug)
    .neq("id", id)
    .maybeSingle();
  if (existing) {
    return {
      error:
        "That slug is already used by another event. Leave the slug blank to keep the current share link.",
    };
  }

  const { error } = await supabase
    .from("events")
    .update({ ...parsed, slug })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) {
    await supabase.from("events").delete().eq("id", id);
  }
  revalidatePath("/", "layout");
  redirect("/admin");
}

// ---------------------------------------------------------------------------
// Admin — registration management
// ---------------------------------------------------------------------------

export async function updateRegistrationStatus(
  formData: FormData,
): Promise<void> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "").trim();
  if (id && status) {
    await supabase.from("registrations").update({ status }).eq("id", id);
  }
  revalidatePath("/admin", "layout");
}
