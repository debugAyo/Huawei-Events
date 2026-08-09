export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type RegistrationStatus =
  | "confirmed"
  | "waitlisted"
  | "cancelled"
  | "checked_in";

export type EventCategory =
  | "Bootcamp"
  | "Hackathon"
  | "Workshop"
  | "Talk"
  | "Meetup"
  | "Competition"
  | "Other";

export interface EventRow {
  id: string;
  title: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  cover_image_url: string | null;
  venue: string | null;
  city: string | null;
  start_time: string;
  end_time: string | null;
  capacity: number | null;
  price: number;
  organizer: string | null;
  category: EventCategory | null;
  status: EventStatus;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface RegistrationRow {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  matric_number: string | null;
  department: string | null;
  level: string | null;
  notes: string | null;
  status: RegistrationStatus;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface RegisterResult {
  registration_id: string;
  status: RegistrationStatus;
  waitlist_position: number;
}
