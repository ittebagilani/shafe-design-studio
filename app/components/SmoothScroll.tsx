"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

export function SmoothScroll({ children }: { children: ReactNode }) {
  const ref = useRef<LenisRef>(null);
  const pathname = usePathname();

  // On client-side navigation Lenis keeps the old page's scroll position and
  // measured height, which leaves the bottom of a taller page unreachable.
  // Jump to top and re-measure once the new route has painted.
  useEffect(() => {
    const lenis = ref.current?.lenis;
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true });
    const id = requestAnimationFrame(() => lenis.resize());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <ReactLenis root ref={ref} options={{ lerp: 0.09, duration: 1.2, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
