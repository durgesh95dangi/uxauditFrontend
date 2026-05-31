"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { trackGa4PageView } from "../../lib/analytics/ga4.js";

function Ga4PageTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      lastPathRef.current = pagePath;
      return;
    }

    if (lastPathRef.current === pagePath) return;
    lastPathRef.current = pagePath;

    trackGa4PageView(pagePath);
  }, [pathname, searchParams]);

  return null;
}

/** Tracks App Router client navigations only (initial page_view comes from gtag config). */
export default function Ga4PageTracker() {
  return (
    <Suspense fallback={null}>
      <Ga4PageTrackerInner />
    </Suspense>
  );
}
