"use client";

import { useEffect, useRef, useState } from "react";

// Sticky-reveal footer (article "Method 2"): the panel is revealed as the section
// above slides up, but uses position:sticky instead of fixed so a panel taller than
// the viewport still scrolls through fully. Height is measured so the offsets stay
// correct across breakpoints rather than being hardcoded.
export function StickyFooter({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      data-nav-dark
      className="relative"
      style={{ height, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
    >
      <div
        className="relative"
        style={{ height: `calc(100vh + ${height}px)`, top: "-100vh" }}
      >
        <div
          ref={ref}
          className="sticky"
          style={{ top: `calc(100vh - ${height}px)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
