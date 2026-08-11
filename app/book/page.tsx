import type { Metadata } from "next";
import { BookingForm } from "./BookingForm";

export const metadata: Metadata = { title: "Book a Consultation — SHAFE" };

export default function BookPage() {
  return (
    <div className="grain min-h-screen bg-cream">
      <BookingForm />
    </div>
  );
}
