"use client";

import { usePathname } from "next/navigation";
import { StickyFooter } from "./StickyFooter";
import { Footer } from "./Footer";

// Routes that opt out of the global footer.
const hidden = ["/book"];

export function SiteFooter() {
  const pathname = usePathname();
  if (hidden.includes(pathname)) return null;
  return (
    <StickyFooter>
      <Footer showMap={pathname === "/"} />
    </StickyFooter>
  );
}
