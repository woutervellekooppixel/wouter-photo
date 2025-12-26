"use client";
import { useEffect } from "react";

export default function AnalyticsInit() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) { window.dataLayer.push(args); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-SGRS9782NB', {
      page_title: document.title,
      page_location: window.location.href
    });
    // Debug logging
    console.log('🔵 Google Analytics geïnitialiseerd:', 'G-SGRS9782NB');
  }, []);
  return null;
}
