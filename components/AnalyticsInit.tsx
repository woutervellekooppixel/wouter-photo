"use client";
import { useEffect } from "react";

export default function AnalyticsInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Avoid double-initialization (e.g. when GTM also configures GA4)
    if ((window as any).__wv_ga4_initialized) return;
    (window as any).__wv_ga4_initialized = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) { window.dataLayer.push(args); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-SGRS9782NB', {
      page_title: document.title,
      page_location: window.location.href
    });
  }, []);
  return null;
}
