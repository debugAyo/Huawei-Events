import { describe, expect, it } from "vitest";
import {
  validateEventForm,
  validateRegistrationInput,
} from "./validation";

describe("validateEventForm", () => {
  it("rejects an end time that is before the start time", () => {
    const result = validateEventForm({
      title: "Build with AI",
      start_time: "2026-08-10T10:00:00.000Z",
      end_time: "2026-08-10T09:00:00.000Z",
      capacity: 50,
      price: 0,
    });

    expect(result).toBe("End time must be after the start time.");
  });

  it("rejects invalid capacity values", () => {
    const result = validateEventForm({
      title: "Build with AI",
      start_time: "2026-08-10T10:00:00.000Z",
      capacity: 0,
      price: 0,
    });

    expect(result).toBe("Capacity must be at least 1 if provided.");
  });
});

describe("validateRegistrationInput", () => {
  it("rejects a missing event id", () => {
    const result = validateRegistrationInput({
      eventId: "",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(result).toBe("Missing event selection.");
  });

  it("rejects an invalid email address", () => {
    const result = validateRegistrationInput({
      eventId: "evt-123",
      fullName: "Ada Lovelace",
      email: "not-an-email",
    });

    expect(result).toBe("Please enter a valid email address.");
  });

  it("rejects a very short full name", () => {
    const result = validateRegistrationInput({
      eventId: "evt-123",
      fullName: "A",
      email: "ada@example.com",
    });

    expect(result).toBe("Please enter your full name.");
  });
});
