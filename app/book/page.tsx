import type { Metadata } from "next";
import { BookingForm } from "./BookingForm";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Book a free initial consultation with SHAFE Design Studio to talk through your space, budget, and timeline.",
  alternates: { canonical: "/book" },
};

export default function BookPage() {
  return (
    <div className="grain min-h-screen bg-cream">
      <BookingForm />
    </div>
  );
}
