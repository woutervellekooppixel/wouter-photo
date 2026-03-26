"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const GA4_MEASUREMENT_ID = "G-SGRS9782NB";

export default function GA4PageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;

    const query = window.location.search || "";
    const pagePath = `${pathname}${query}`;
    const pageLocation = window.location.href;
    const pageTitle = document.title;

    window.gtag("event", "page_view", {
      send_to: GA4_MEASUREMENT_ID,
      page_title: pageTitle,
      page_location: pageLocation,
      page_path: pagePath,
    });
  }, [pathname]);

  return null;
}
