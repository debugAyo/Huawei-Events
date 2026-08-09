import { isValidEmail } from "./utils";

export interface EventFormValidationInput {
  title?: string;
  start_time?: string | null;
  end_time?: string | null;
  capacity?: number | null;
  price?: number | null;
}

export interface RegistrationValidationInput {
  eventId?: string;
  fullName?: string;
  email?: string;
}

export function validateEventForm(input: EventFormValidationInput): string | null {
  if (!input.title?.trim()) {
    return "Title is required.";
  }

  if (!input.start_time) {
    return "Start time is required.";
  }

  if (input.end_time) {
    const start = new Date(input.start_time);
    const end = new Date(input.end_time);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Please enter valid date and time values.";
    }

    if (end.getTime() <= start.getTime()) {
      return "End time must be after the start time.";
    }
  }

  if (input.capacity !== null && input.capacity !== undefined && input.capacity <= 0) {
    return "Capacity must be at least 1 if provided.";
  }

  if (input.price !== null && input.price !== undefined && input.price < 0) {
    return "Price cannot be negative.";
  }

  return null;
}

export function validateRegistrationInput(
  input: RegistrationValidationInput,
): string | null {
  if (!input.eventId?.trim()) {
    return "Missing event selection.";
  }

  if (!input.fullName?.trim() || input.fullName.trim().length < 2) {
    return "Please enter your full name.";
  }

  if (!input.email?.trim() || !isValidEmail(input.email.trim())) {
    return "Please enter a valid email address.";
  }

  return null;
}
