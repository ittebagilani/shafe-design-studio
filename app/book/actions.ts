"use server";

// Sends a booking-request email to the owner and a confirmation to the client
// via Resend's REST API.
// ponytail: raw fetch, no `resend` package — one POST per email does the job.
// Set RESEND_API_KEY and BOOKING_TO_EMAIL in the environment.
// BOOKING_FROM_EMAIL defaults to Resend's shared onboarding sender, which works
// with no domain setup; swap it for an address on your verified domain later.

import { bookedSlots, reserveSlot } from "../lib/bookings";

export type BookingState = { ok: boolean; error?: string };

// Called from the client as the date/slot are picked, so already-booked
// times can be greyed out before the user even tries to submit.
export async function getBookedSlots(date: string): Promise<string[]> {
  return bookedSlots(date);
}

const FIELDS = [
  ["call", "Call"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["projectType", "Project type"],
  ["stage", "Stage"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
  ["referral", "Heard about us"],
  ["referredBy", "Referred by"],
  ["date", "Preferred date"],
  ["slot", "Time slot"],
] as const;

const FROM = process.env.BOOKING_FROM_EMAIL ?? "SHAFE Booking <onboarding@resend.dev>";

async function send(payload: Record<string, unknown>, apiKey: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, ...payload }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
  return res.ok;
}

export async function submitBooking(
  _prev: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const v = Object.fromEntries(
    FIELDS.map(([key]) => [key, String(formData.get(key) ?? "").trim()]),
  ) as Record<(typeof FIELDS)[number][0], string>;
  const message = String(formData.get("message") ?? "").trim();

  if (!v.name || !v.email) return { ok: false, error: "Name and email are required." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email))
    return { ok: false, error: "Please enter a valid email." };
  if (!v.date || !v.slot) return { ok: false, error: "Please pick a date and time." };

  // Reserve before emailing — a failed reservation means someone else just
  // took this slot, so there's nothing to send.
  const reserved = await reserveSlot(v.date, v.slot);
  if (!reserved) {
    return { ok: false, error: "That time was just booked — please pick another." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("Booking email not configured: set RESEND_API_KEY and BOOKING_TO_EMAIL");
    return { ok: false, error: "Booking is temporarily unavailable. Please try again later." };
  }

  const summary = FIELDS.map(
    ([key, label]) => `${label}: ${v[key] || "Not provided"}`,
  ).join("\n");

  const sent = await send(
    {
      to,
      reply_to: v.email,
      subject: `New consultation booking: ${v.name}`,
      text: `New consultation booking:\n\n${summary}\n\nDetails:\n${message || "Not provided"}`,
    },
    apiKey,
  );
  if (!sent) return { ok: false, error: "Could not send your request. Please try again." };

  // Confirmation to the client. A failure here shouldn't fail the booking —
  // the studio already has the request.
  await send(
    {
      to: v.email,
      reply_to: to,
      subject: "We received your consultation request",
      text: [
        `Hi ${v.name},`,
        "",
        "Thanks for reaching out to SHAFE Design Studio. We've received your",
        "consultation request and will reply shortly to confirm a time.",
        "",
        "Here's what you sent us:",
        "",
        summary,
        "",
        "Details:",
        message || "Not provided",
        "",
        "SHAFE Design Studio",
      ].join("\n"),
    },
    apiKey,
  );

  return { ok: true };
}
